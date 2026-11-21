// The screenshot scenes behind ?shot=start|play|play2|win. Each one plays the real rules:
// it clicks real difference zones through world.clickAt, so the frame is what a short game
// really looks like — and the same seed always gives the same frame (the rooms are fixed
// compositions and the finds are fixed lists, never random).

import { STEP, PANELS, ROOMS } from './config.js';
import { SCREEN_TITLE, SCREEN_PLAY, SCREEN_WON } from './render.js';

/** Click a difference by id on the left panel, through the real click rules. */
function findById(world, id) {
  const room = ROOMS[world.state.roomIndex];
  const d = room.differences.find((x) => x.id === id);
  if (!d) return;
  world.clickAt(PANELS.left.x + d.x, PANELS.left.y + d.y);
}

/** Run the timer forward a fixed number of seconds without any clicks. */
function waitSeconds(world, seconds) {
  for (let i = 0; i < seconds / STEP; i += 1) world.step(STEP);
}

/**
 * Set `world` to the named scene (start, play, play2 or win; any other name is start) and
 * return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  if (name === 'play') {
    // Room 1 mid-hunt: 4 found (ringed), 8 still hidden, counter reads "Found 4 / 12".
    world.startRoom(0);
    findById(world, 'moon-full');
    findById(world, 'clock-time');
    findById(world, 'cat-tail');
    findById(world, 'picture');
    waitSeconds(world, 45);
    return { screen: SCREEN_PLAY, best: 0, t: 1.25 };
  }
  if (name === 'play2') {
    // Room 2 mid-hunt with a hint pulsing around an unfound difference.
    world.startRoom(1);
    findById(world, 'globe-land');
    findById(world, 'fire-size');
    waitSeconds(world, 30);
    // Spend a hint on a fixed difference (the portrait) so the ring is deterministic:
    // hint() picks at random, so stage it directly instead.
    world.state.hintsLeft -= 1;
    world.state.score = Math.max(0, world.state.score - 50);
    const pick = ROOMS[1].differences.find((d) => d.id === 'portrait-eyes');
    world.state.hint = { diff: pick, t: 2.5 };
    return { screen: SCREEN_PLAY, best: 0, t: 1.25 };
  }
  if (name === 'win') {
    // Room 1 all found: every difference ringed, "Room Complete!" banner with stars.
    // Let the score popups fade first so the rings read cleanly.
    world.startRoom(0);
    for (const d of ROOMS[0].differences) findById(world, d.id);
    waitSeconds(world, 1.2);
    return { screen: SCREEN_WON, best: 0, t: 1.25 };
  }
  world.toTitle();
  return { screen: SCREEN_TITLE, best: 0, t: 1.25 };
}
