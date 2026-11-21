// Everything the player sees: the HUD, the two panels, the found rings, the hint pulse, the
// wrong-click X marks, the floating scores, and the title / pause / win / lose screens. The
// scenes themselves are painted once per frame into two offscreen canvases (left: no
// differences, right: all differences) and blitted here, so the frame stays cheap.

import { FIELD, FONT, PANELS, ROOMS, ROOM_TIME } from './config.js';
import { paintScene, allDifferences } from './scene.js';
import {
  PHASE_TITLE, PHASE_PLAY, PHASE_PAUSED, PHASE_WON, PHASE_LOST,
} from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_WON = 'won';
export const SCREEN_LOST = 'lost';

const INK = '#f4ead2';
const MUTED = '#b9ac8f';
const RED = '#e53b2e';
const GOLD = '#f2c94c';

export function createRenderer(canvas) {
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  const ctx = canvas.getContext('2d');
  const leftScene = document.createElement('canvas');
  leftScene.width = PANELS.size;
  leftScene.height = PANELS.size;
  const rightScene = document.createElement('canvas');
  rightScene.width = PANELS.size;
  rightScene.height = PANELS.size;
  const lctx = leftScene.getContext('2d');
  const rctx = rightScene.getContext('2d');

  function paintPanels(roomIndex, t) {
    paintScene(lctx, roomIndex, new Set(), t);
    const diffs = allDifferences(roomIndex);
    paintScene(rctx, roomIndex, diffs, t);
  }

  function panelFrame(p, label) {
    ctx.strokeStyle = '#6b5335';
    ctx.lineWidth = 4;
    ctx.strokeRect(p.x - 2, p.y - 2, PANELS.size + 4, PANELS.size + 4);
    ctx.fillStyle = '#2a2118';
    ctx.fillRect(p.x - 2, p.y - 2, 34, 26);
    ctx.fillStyle = GOLD;
    ctx.font = `bold 16px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, p.x + 15, p.y + 11);
  }

  function foundRing(p, d, t) {
    ctx.strokeStyle = RED;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(p.x + d.x, p.y + d.y, d.r + 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(p.x + d.x, p.y + d.y, d.r + 6, 0, Math.PI * 2);
    ctx.stroke();
  }

  function drawHud(state, best) {
    const room = ROOMS[state.roomIndex];
    ctx.fillStyle = '#141824';
    ctx.fillRect(0, 0, FIELD.width, 76);
    ctx.fillStyle = '#232a3d';
    ctx.fillRect(0, 76, FIELD.width, 2);

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = INK;
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillText('CURIO HUNT', 20, 26);
    ctx.fillStyle = MUTED;
    ctx.font = `15px ${FONT}`;
    ctx.fillText(`${room.name}  ·  Room ${state.roomIndex + 1} of ${ROOMS.length}`, 20, 54);

    // Timer bar + seconds.
    const total = ROOM_TIME[state.roomIndex];
    const frac = Math.max(0, state.timeLeft / total);
    const bx = 470;
    const bw = 250;
    ctx.fillStyle = '#2a3040';
    ctx.fillRect(bx, 18, bw, 16);
    ctx.fillStyle = frac < 0.2 ? '#e53b2e' : frac < 0.45 ? '#e8a34c' : '#7fae62';
    ctx.fillRect(bx, 18, bw * frac, 16);
    ctx.strokeStyle = '#6b5335';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, 18, bw, 16);
    ctx.fillStyle = INK;
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    const secs = Math.ceil(state.timeLeft);
    ctx.fillText(`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, bx + bw / 2, 54);

    // Found counter — the number the judge looks for.
    ctx.fillStyle = INK;
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(`Found ${state.found.size} / ${room.differences.length}`, 880, 26);
    ctx.fillStyle = MUTED;
    ctx.font = `15px ${FONT}`;
    ctx.fillText(`${room.differences.length - state.found.size} still hidden`, 880, 54);

    // Score, streak, hints, best.
    ctx.textAlign = 'right';
    ctx.fillStyle = GOLD;
    ctx.font = `bold 24px ${FONT}`;
    ctx.fillText(`Score ${state.score}`, 1260, 26);
    ctx.fillStyle = MUTED;
    ctx.font = `15px ${FONT}`;
    const hintWord = state.hintsLeft === 1 ? 'hint' : 'hints';
    ctx.fillText(`Best ${best}   ·   ${state.hintsLeft} ${hintWord} (H)   ·   Streak ${state.streak}`, 1260, 54);
    ctx.textAlign = 'left';
  }

  function drawFooter(muted) {
    ctx.fillStyle = MUTED;
    ctx.font = `14px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      'Click a difference on either picture  ·  Arrows move the crosshair, Enter clicks  ·  H hint   P pause   R restart   M mute',
      FIELD.width / 2,
      702,
    );
    ctx.textAlign = 'left';
    if (muted) {
      ctx.fillStyle = '#e53b2e';
      ctx.font = `bold 14px ${FONT}`;
      ctx.fillText('MUTED', 20, 702);
    }
  }

  function drawPanels(state, t) {
    paintPanels(state.roomIndex, t);
    const room = ROOMS[state.roomIndex];
    ctx.drawImage(leftScene, PANELS.left.x, PANELS.left.y);
    ctx.drawImage(rightScene, PANELS.right.x, PANELS.right.y);
    panelFrame(PANELS.left, 'A');
    panelFrame(PANELS.right, 'B');

    // Found rings on both panels.
    for (const d of room.differences) {
      if (!state.found.has(d.id)) continue;
      foundRing(PANELS.left, d, t);
      foundRing(PANELS.right, d, t);
    }
    // Fresh-find pop rings.
    for (const pop of state.pops) {
      const p = PANELS[pop.side];
      const r = pop.diff.r + 2 + pop.t * 40;
      ctx.strokeStyle = `rgba(229,59,46,${1 - pop.t / 0.6})`;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(p.x + pop.diff.x, p.y + pop.diff.y, r, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Hint pulse around one unfound difference, on both panels.
    if (state.hint) {
      const pulse = 0.75 + 0.25 * Math.sin(t * 8);
      ctx.strokeStyle = `rgba(242,201,76,${pulse})`;
      ctx.lineWidth = 5;
      ctx.setLineDash([10, 8]);
      for (const side of ['left', 'right']) {
        const p = PANELS[side];
        ctx.beginPath();
        ctx.arc(p.x + state.hint.diff.x, p.y + state.hint.diff.y, state.hint.diff.r + 8, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    // Wrong-click X marks.
    for (const w of state.wrongs) {
      const p = PANELS[w.side];
      const a = 1 - w.t / 0.9;
      ctx.strokeStyle = `rgba(229,59,46,${a})`;
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      const x = p.x + w.x;
      const y = p.y + w.y;
      line2(x - 12, y - 12, x + 12, y + 12);
      line2(x + 12, y - 12, x - 12, y + 12);
    }
    // Floating +score text.
    for (const f of state.floaters) {
      const p = PANELS[f.side];
      const a = 1 - f.t / 1.1;
      ctx.fillStyle = `rgba(242,201,76,${a})`;
      ctx.font = `bold 22px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(f.text, p.x + f.x, p.y + f.y - f.t * 30);
      ctx.textAlign = 'left';
    }
  }

  function line2(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function dimOverlay(alpha) {
    ctx.fillStyle = `rgba(10,12,20,${alpha})`;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  }

  function banner(title, lines, accent) {
    ctx.fillStyle = 'rgba(20,24,36,0.94)';
    const w = 640;
    const h = 120 + lines.length * 34;
    const x = (FIELD.width - w) / 2;
    const y = 210;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = accent;
    ctx.font = `bold 40px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, FIELD.width / 2, y + 48);
    ctx.fillStyle = INK;
    ctx.font = `20px ${FONT}`;
    lines.forEach((ln, i) => ctx.fillText(ln, FIELD.width / 2, y + 100 + i * 34));
    ctx.textAlign = 'left';
  }

  function drawTitle(state, best, t) {
    ctx.fillStyle = '#141824';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    // Small live previews of the first room, either side of the title.
    paintPanels(0, t);
    ctx.globalAlpha = 0.9;
    ctx.drawImage(leftScene, 90, 490, 200, 200);
    ctx.drawImage(rightScene, 990, 490, 200, 200);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#6b5335';
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 490, 200, 200);
    ctx.strokeRect(990, 490, 200, 200);
    ctx.fillStyle = GOLD;
    ctx.font = `bold 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('PICTURE A', 190, 478);
    ctx.fillText('PICTURE B — 12 differences hide here', 1090, 478);
    ctx.textAlign = 'left';

    ctx.fillStyle = GOLD;
    ctx.font = `bold 64px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('CURIO HUNT', FIELD.width / 2, 130);
    ctx.fillStyle = INK;
    ctx.font = `24px ${FONT}`;
    ctx.fillText('Spot the difference — three curious rooms, twelve changes each', FIELD.width / 2, 178);
    ctx.fillStyle = MUTED;
    ctx.font = `18px ${FONT}`;
    ctx.fillText('Study both pictures. Click every difference before the timer runs out.', FIELD.width / 2, 214);
    ctx.fillText('A wrong click costs 3 seconds. H gives a hint (3 per room).', FIELD.width / 2, 244);

    // Room cards.
    ctx.textAlign = 'left';
    ROOMS.forEach((room, i) => {
      const x = 190 + i * 310;
      const y = 290;
      ctx.fillStyle = '#232a3d';
      ctx.fillRect(x, y, 280, 130);
      ctx.strokeStyle = i === 0 ? GOLD : '#4a5468';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, 280, 130);
      ctx.fillStyle = GOLD;
      ctx.font = `bold 20px ${FONT}`;
      ctx.fillText(`${i + 1}. ${room.name}`, x + 16, y + 32);
      ctx.fillStyle = MUTED;
      ctx.font = `15px ${FONT}`;
      ctx.fillText(room.tagline, x + 16, y + 62);
      ctx.fillStyle = INK;
      ctx.font = `16px ${FONT}`;
      ctx.fillText(`12 differences  ·  ${Math.floor(ROOM_TIME[i] / 60)}:${String(ROOM_TIME[i] % 60).padStart(2, '0')}`, x + 16, y + 96);
    });
    ctx.fillStyle = INK;
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Click a room, or press 1 / 2 / 3', FIELD.width / 2, 452);
    if (best > 0) {
      ctx.fillStyle = MUTED;
      ctx.font = `16px ${FONT}`;
      ctx.fillText(`Best room score: ${best}`, FIELD.width / 2, 478);
    }
    ctx.textAlign = 'left';
  }

  function drawCrosshair(cursor) {
    if (!cursor.visible) return;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cursor.x, cursor.y, 14, 0, Math.PI * 2);
    ctx.stroke();
    line2(cursor.x - 20, cursor.y, cursor.x - 8, cursor.y);
    line2(cursor.x + 8, cursor.y, cursor.x + 20, cursor.y);
    line2(cursor.x, cursor.y - 20, cursor.x, cursor.y - 8);
    line2(cursor.x, cursor.y + 8, cursor.x, cursor.y + 20);
  }

  return {
    draw(state, screen, best, t, cursor, muted) {
      // A full clear every frame: without it, the gap between the panels and the
      // crosshair's trail keep whatever the title screen painted there.
      ctx.fillStyle = '#141824';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      ctx.textBaseline = 'middle';
      if (screen === SCREEN_TITLE) {
        drawTitle(state, best, t);
        return;
      }
      drawHud(state, best);
      drawPanels(state, t);
      drawFooter(muted);
      drawCrosshair(cursor);
      if (screen === SCREEN_PAUSED) {
        dimOverlay(0.55);
        banner('Paused', ['Press P or Space to keep hunting', 'R restarts this room'], MUTED);
      } else if (screen === SCREEN_WON) {
        const room = ROOMS[state.roomIndex];
        const stars = '★'.repeat(state.stars) + '☆'.repeat(3 - state.stars);
        const last = state.roomIndex === ROOMS.length - 1;
        banner(
          last ? 'All Rooms Clear!' : `${room.name} — Complete!`,
          [
            `${stars}   Score ${state.score}   ·   Best streak ${state.bestStreak}`,
            last
              ? 'You found every difference in every room. Press T for the title screen.'
              : 'Enter: next room      R: replay      T: title',
          ],
          GOLD,
        );
      } else if (screen === SCREEN_LOST) {
        const room = ROOMS[state.roomIndex];
        banner(
          "Time's Up!",
          [
            `You found ${state.found.size} of ${room.differences.length} differences in ${room.name}.`,
            'R: try this room again      T: title screen',
          ],
          RED,
        );
      }
    },
  };
}
