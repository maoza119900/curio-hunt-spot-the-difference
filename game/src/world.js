// The game's state and rules, with no DOM dependency, so Node can unit-test it: which room is
// open, which differences are found, the timer, score, hints and streak. Clicks arrive in field
// coordinates; the world maps them onto a panel and tests the difference zones. Rendering only
// reads world.state.

import { PANELS, ROOMS, ROOM_TIME, SCORE, HINTS_PER_ROOM, HINT_SECONDS, STEP } from './config.js';

export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_WIN = 4;
export const EVENT_LOSE = 8;
export const EVENT_TICK = 16;

export const PHASE_TITLE = 'title';
export const PHASE_PLAY = 'play';
export const PHASE_PAUSED = 'paused';
export const PHASE_WON = 'won';
export const PHASE_LOST = 'lost';

/** Which panel a field point is in, and its scene coordinates; null when outside both panels. */
export function fieldToScene(x, y) {
  for (const side of ['left', 'right']) {
    const p = PANELS[side];
    if (x >= p.x && x < p.x + PANELS.size && y >= p.y && y < p.y + PANELS.size) {
      return { side, x: x - p.x, y: y - p.y };
    }
  }
  return null;
}

export function createWorld(rng) {
  const state = {
    phase: PHASE_TITLE,
    roomIndex: 0,
    found: new Set(),
    timeLeft: ROOM_TIME[0],
    score: 0,
    streak: 0,
    bestStreak: 0,
    hintsLeft: HINTS_PER_ROOM,
    hint: null, // { diff, t } while a hint ring is pulsing
    floaters: [], // { side, x, y, text, t } rising score text
    wrongs: [], // { side, x, y, t } fading red X marks
    pops: [], // { side, diff, t } ring pop animation on a fresh find
    lastTickSecond: -1,
    roomsCleared: 0,
    stars: 0,
    totalScore: 0,
  };

  function room() {
    return ROOMS[state.roomIndex];
  }

  function startRoom(index) {
    state.roomIndex = index;
    state.found = new Set();
    state.timeLeft = ROOM_TIME[index];
    state.score = 0;
    state.streak = 0;
    state.hintsLeft = HINTS_PER_ROOM;
    state.hint = null;
    state.floaters = [];
    state.wrongs = [];
    state.pops = [];
    state.lastTickSecond = -1;
    state.phase = PHASE_PLAY;
  }

  function awardWin() {
    const timeBonus = Math.ceil(state.timeLeft) * SCORE.timeBonusPerSecond;
    const hintBonus = state.hintsLeft * SCORE.unusedHintBonus;
    state.score += timeBonus + hintBonus;
    state.totalScore += state.score;
    const fraction = state.timeLeft / ROOM_TIME[state.roomIndex];
    state.stars = fraction >= 0.6 ? 3 : fraction >= 0.3 ? 2 : 1;
    state.roomsCleared += 1;
    state.phase = PHASE_WON;
    return { timeBonus, hintBonus };
  }

  /** Click at field coordinates. Returns 'found' | 'wrong' | 'ignored'. */
  function clickAt(fx, fy) {
    if (state.phase !== PHASE_PLAY) return 'ignored';
    const hit = fieldToScene(fx, fy);
    if (!hit) return 'ignored';
    const diffs = room().differences;
    for (let i = 0; i < diffs.length; i += 1) {
      const d = diffs[i];
      if (state.found.has(d.id)) continue;
      const dx = hit.x - d.x;
      const dy = hit.y - d.y;
      if (dx * dx + dy * dy <= d.r * d.r) {
        state.found.add(d.id);
        state.streak += 1;
        state.bestStreak = Math.max(state.bestStreak, state.streak);
        const gained = SCORE.perFind + SCORE.streakBonus * (state.streak - 1);
        state.score += gained;
        state.floaters.push({ side: hit.side, x: hit.x, y: hit.y - d.r - 6, text: `+${gained}`, t: 0 });
        state.pops.push({ side: 'left', diff: d, t: 0 });
        state.pops.push({ side: 'right', diff: d, t: 0 });
        if (state.found.size === diffs.length) awardWin();
        return 'found';
      }
    }
    // A wrong click: the timer pays for it and the streak resets.
    state.streak = 0;
    state.timeLeft = Math.max(0, state.timeLeft - SCORE.wrongClickSeconds);
    state.wrongs.push({ side: hit.side, x: hit.x, y: hit.y, t: 0 });
    if (state.timeLeft <= 0) state.phase = PHASE_LOST;
    return 'wrong';
  }

  /** Spend a hint: pulse a ring around one unfound difference on both panels. */
  function useHint() {
    if (state.phase !== PHASE_PLAY || state.hintsLeft <= 0) return null;
    const remaining = room().differences.filter((d) => !state.found.has(d.id));
    if (remaining.length === 0) return null;
    const pick = remaining[Math.floor(rng() * remaining.length)];
    state.hintsLeft -= 1;
    state.score = Math.max(0, state.score - SCORE.hintCost);
    state.hint = { diff: pick, t: HINT_SECONDS };
    return pick;
  }

  /** Advance the timer and the short-lived effects. Returns an event bitmask. */
  function step(dt) {
    let events = 0;
    if (state.phase === PHASE_PLAY) {
      state.timeLeft -= dt;
      const whole = Math.ceil(state.timeLeft);
      if (state.timeLeft <= 10.5 && whole !== state.lastTickSecond && whole > 0) {
        state.lastTickSecond = whole;
        events |= EVENT_TICK;
      }
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.phase = PHASE_LOST;
        events |= EVENT_LOSE;
      }
    }
    if (state.hint) {
      state.hint.t -= dt;
      if (state.hint.t <= 0) state.hint = null;
    }
    for (const f of state.floaters) f.t += dt;
    state.floaters = state.floaters.filter((f) => f.t < 1.1);
    for (const w of state.wrongs) w.t += dt;
    state.wrongs = state.wrongs.filter((w) => w.t < 0.9);
    for (const p of state.pops) p.t += dt;
    state.pops = state.pops.filter((p) => p.t < 0.6);
    return events;
  }

  return {
    state,
    room,
    startRoom,
    clickAt,
    useHint,
    step,
    toTitle() {
      state.phase = PHASE_TITLE;
    },
    pause() {
      if (state.phase === PHASE_PLAY) state.phase = PHASE_PAUSED;
    },
    resume() {
      if (state.phase === PHASE_PAUSED) state.phase = PHASE_PLAY;
    },
    nextRoom() {
      const next = state.roomIndex + 1;
      if (next < ROOMS.length) startRoom(next);
      else state.phase = PHASE_TITLE;
    },
  };
}

export { STEP };
