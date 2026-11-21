// Keyboard and pointer input. Clicks are reported in logical 1280x720 field coordinates.
// Arrow keys move a crosshair cursor (for keyboard-only play); Enter/Space clicks at it.
// One-shot actions (confirm, hint, pause, restart, mute, room select) are consumed with
// takeActions() so a held key never fires twice.

export const ACTION_CONFIRM = 1;
export const ACTION_HINT = 2;
export const ACTION_PAUSE = 4;
export const ACTION_RESTART = 8;
export const ACTION_MUTE = 16;
export const ACTION_TITLE = 32;

import { FIELD, PANELS } from './config.js';

export function createInput(canvas) {
  let actions = 0;
  /** Pending clicks in field coordinates, oldest first. */
  const clicks = [];
  /** Crosshair cursor, in field coordinates; starts in the middle of the left panel. */
  const cursor = { x: PANELS.left.x + PANELS.size / 2, y: PANELS.left.y + PANELS.size / 2, visible: false };
  const keys = new Set();

  function toField(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * FIELD.width,
      y: ((event.clientY - rect.top) / rect.height) * FIELD.height,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    const p = toField(event);
    cursor.x = p.x;
    cursor.y = p.y;
    cursor.visible = false;
    clicks.push(p);
  });

  canvas.addEventListener('pointermove', (event) => {
    const p = toField(event);
    cursor.x = p.x;
    cursor.y = p.y;
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const k = event.key;
    if (k === ' ' || k === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (k === 'h' || k === 'H') actions |= ACTION_HINT;
    else if (k === 'p' || k === 'P' || k === 'Escape') actions |= ACTION_PAUSE;
    else if (k === 'r' || k === 'R') actions |= ACTION_RESTART;
    else if (k === 'm' || k === 'M') actions |= ACTION_MUTE;
    else if (k === 't' || k === 'T') actions |= ACTION_TITLE;
    else if (k === '1' || k === '2' || k === '3') actions |= 64 << (Number(k) - 1);
    else if (k.startsWith('Arrow')) {
      keys.add(k);
      cursor.visible = true;
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key));
  window.addEventListener('blur', () => keys.clear());

  /** Move the crosshair with held arrow keys; call once per fixed step. */
  function moveCursor(dt) {
    const speed = 520;
    if (keys.has('ArrowLeft')) cursor.x -= speed * dt;
    if (keys.has('ArrowRight')) cursor.x += speed * dt;
    if (keys.has('ArrowUp')) cursor.y -= speed * dt;
    if (keys.has('ArrowDown')) cursor.y += speed * dt;
    cursor.x = Math.max(0, Math.min(FIELD.width, cursor.x));
    cursor.y = Math.max(0, Math.min(FIELD.height, cursor.y));
  }

  return {
    cursor,
    moveCursor,
    takeActions() {
      const a = actions;
      actions = 0;
      return a;
    },
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    /** A confirm keypress clicks at the crosshair (keyboard play). */
    confirmClick() {
      return { x: cursor.x, y: cursor.y };
    },
  };
}
