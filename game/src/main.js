// Boot and the one loop: input is read every frame, the world advances in fixed 1/60 s steps
// (several in a slow frame, none in a fast one), and the renderer paints what is there. The game
// moves between four screens: title, play, paused, and the win/lose banners over the panels.
//
// ?seed=N fixes the cosmetic seed. ?shot=start|play|play2|win (with &seed=N) stages that scene
// instead of running the loop, paints it twice and sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_LOSE, EVENT_TICK } from './world.js';
import {
  ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, ACTION_RESTART, ACTION_TITLE,
  createInput,
} from './input.js';
import { createAudio } from './audio.js';
import { createRenderer, SCREEN_LOST, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WON } from './render.js';
import { stageShot } from './shots.js';
import { ROOMS } from './config.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped, not replayed. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, scene.t, { visible: false }, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let muted = false;
  let accumulator = 0;
  let last = performance.now();
  let elapsed = 0;

  function announce(message) {
    status.textContent = message;
  }

  function startRoom(index) {
    world.startRoom(index);
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce(`Playing ${ROOMS[index].name}. Find ${ROOMS[index].differences.length} differences.`);
  }

  function finishRoom() {
    screen = SCREEN_WON;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    audio.win();
    announce(`Room complete. Score ${world.state.score}. Best ${best}.`);
  }

  function loseRoom() {
    screen = SCREEN_LOST;
    audio.lose();
    announce(`Time's up. You found ${world.state.found.size} of ${ROOMS[world.state.roomIndex].differences.length}.`);
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      muted = audio.toggleMute();
      announce(muted ? 'Muted.' : 'Sound on.');
    }
    if (screen === SCREEN_TITLE) {
      if (actions & 64) startRoom(0);
      else if (actions & 128) startRoom(1);
      else if (actions & 256) startRoom(2);
      else if (actions & ACTION_CONFIRM) startRoom(0);
      return;
    }
    if (screen === SCREEN_WON) {
      if (actions & ACTION_CONFIRM) {
        world.nextRoom();
        screen = world.state.phase === 'play' ? SCREEN_PLAY : SCREEN_TITLE;
      } else if (actions & ACTION_RESTART) startRoom(world.state.roomIndex);
      else if (actions & ACTION_TITLE) {
        world.toTitle();
        screen = SCREEN_TITLE;
      }
      return;
    }
    if (screen === SCREEN_LOST) {
      if (actions & (ACTION_CONFIRM | ACTION_RESTART)) startRoom(world.state.roomIndex);
      else if (actions & ACTION_TITLE) {
        world.toTitle();
        screen = SCREEN_TITLE;
      }
      return;
    }
    if (screen === SCREEN_PAUSED) {
      if (actions & (ACTION_PAUSE | ACTION_CONFIRM)) {
        world.resume();
        screen = SCREEN_PLAY;
        announce('Playing.');
      } else if (actions & ACTION_RESTART) startRoom(world.state.roomIndex);
      else if (actions & ACTION_TITLE) {
        world.toTitle();
        screen = SCREEN_TITLE;
      }
      return;
    }
    // SCREEN_PLAY
    if (actions & ACTION_PAUSE) {
      world.pause();
      screen = SCREEN_PAUSED;
      announce('Paused.');
    } else if (actions & ACTION_RESTART) startRoom(world.state.roomIndex);
    else if (actions & ACTION_TITLE) {
      world.toTitle();
      screen = SCREEN_TITLE;
    } else if (actions & ACTION_HINT) {
      const picked = world.useHint();
      if (picked) {
        audio.hint();
        announce(`Hint: look near the ${picked.name.toLowerCase()}.`);
      }
    }
    if (actions & ACTION_CONFIRM) {
      const at = input.confirmClick();
      const result = world.clickAt(at.x, at.y);
      if (result === 'found') {
        audio.find();
        if (world.state.phase === 'won') finishRoom();
        else announce(`Found ${world.state.found.size} of ${ROOMS[world.state.roomIndex].differences.length}.`);
      } else if (result === 'wrong') {
        audio.wrong();
        announce('Not a difference. 3 seconds lost.');
      }
    }
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      audio.unlock();
      if (screen === SCREEN_TITLE) {
        // Clicking a room card starts that room.
        for (let i = 0; i < ROOMS.length; i += 1) {
          const x = 190 + i * 310;
          if (click.x >= x && click.x < x + 280 && click.y >= 290 && click.y < 420) {
            startRoom(i);
            return;
          }
        }
        startRoom(0);
        return;
      }
      if (screen !== SCREEN_PLAY) return;
      const result = world.clickAt(click.x, click.y);
      if (result === 'found') {
        audio.find();
        if (world.state.phase === 'won') finishRoom();
        else announce(`Found ${world.state.found.size} of ${ROOMS[world.state.roomIndex].differences.length}.`);
      } else if (result === 'wrong') {
        audio.wrong();
        announce('Not a difference. 3 seconds lost.');
      }
    }
  }

  function step() {
    const events = world.step(STEP);
    if (events & EVENT_TICK) audio.tick();
    if (events & EVENT_LOSE) loseRoom();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    elapsed += dt;
    accumulator += dt;
    handleActions();
    handleClicks();
    input.moveCursor(STEP);
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        step();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, elapsed / 1000, input.cursor, muted);
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      world.pause();
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  announce('Curio Hunt. Pick a room to start hunting for differences.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
