// The three rooms, painted with canvas vector art (no image files, no network). One 600x600
// scene is painted twice: the left panel with no differences, the right panel with every
// difference in the room's table applied. Each difference is a small, fair, visible change —
// a missing spout, a different clock time, a changed colour — never a single-pixel trick.
// `t` is seconds, used only for gentle cosmetic motion (flame flicker); shots pass a fixed t
// so screenshots are reproducible.

import { ROOMS } from './config.js';

/* ---------- small drawing helpers ---------- */

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function circle(ctx, x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** A four-point star sparkle. */
function star(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

/** A book spine standing upright. */
function book(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.fillRect(x + 3, y + 5, w - 6, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.fillRect(x + 3, y + h - 8, w - 6, 3);
}

/** A candle flame, flickering a little with time t. */
function flame(ctx, x, y, t, scale = 1) {
  const wob = Math.sin(t * 5 + x) * 1.5;
  ctx.fillStyle = '#ff9d2e';
  ctx.beginPath();
  ctx.moveTo(x + wob, y - 18 * scale);
  ctx.quadraticCurveTo(x + 8 * scale, y - 4 * scale, x + wob, y + 3 * scale);
  ctx.quadraticCurveTo(x - 8 * scale, y - 4 * scale, x + wob, y - 18 * scale);
  ctx.fill();
  ctx.fillStyle = '#ffe9a8';
  ctx.beginPath();
  ctx.moveTo(x + wob, y - 11 * scale);
  ctx.quadraticCurveTo(x + 4 * scale, y - 2 * scale, x + wob, y + 2 * scale);
  ctx.quadraticCurveTo(x - 4 * scale, y - 2 * scale, x + wob, y - 11 * scale);
  ctx.fill();
}

/** A round clock face with hands at hour:minute. */
function clockFace(ctx, x, y, r, hour, minute) {
  ctx.fillStyle = '#fdf6e3';
  circle(ctx, x, y, r);
  ctx.fill();
  ctx.strokeStyle = '#5f3d22';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#3a2a18';
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    circle(ctx, x + Math.sin(a) * (r - 9), y - Math.cos(a) * (r - 9), i % 3 === 0 ? 3 : 1.6);
    ctx.fill();
  }
  const ha = ((hour % 12) + minute / 60) / 12 * Math.PI * 2;
  const ma = (minute / 60) * Math.PI * 2;
  ctx.strokeStyle = '#3a2a18';
  ctx.lineCap = 'round';
  ctx.lineWidth = 5;
  line(ctx, x, y, x + Math.sin(ha) * r * 0.5, y - Math.cos(ha) * r * 0.5);
  ctx.lineWidth = 3;
  line(ctx, x, y, x + Math.sin(ma) * r * 0.78, y - Math.cos(ma) * r * 0.78);
  ctx.fillStyle = '#c96f2e';
  circle(ctx, x, y, 4);
  ctx.fill();
}

/** Wooden floor planks from y0 to the bottom of the scene. */
function floor(ctx, p, y0) {
  ctx.fillStyle = p.floor;
  ctx.fillRect(0, y0, 600, 600 - y0);
  ctx.strokeStyle = p.floorDark;
  ctx.lineWidth = 2;
  for (let y = y0 + 26; y < 600; y += 26) line(ctx, 0, y, 600, y);
  ctx.strokeStyle = 'rgba(0,0,0,0.12)';
  for (let x = 80; x < 600; x += 130) line(ctx, x, y0, x - 30, 600);
}

/** A soft wall: flat colour with a darker wainscot band above the floor. */
function wall(ctx, p, y0) {
  ctx.fillStyle = p.wall;
  ctx.fillRect(0, 0, 600, y0);
  ctx.fillStyle = p.wallDark;
  ctx.fillRect(0, y0 - 14, 600, 14);
}

/* ---------- Room 1: The Moonlit Attic ---------- */

function paintAttic(ctx, p, diffs, t) {
  wall(ctx, p, 470);
  floor(ctx, p, 470);

  // Window with the night sky, moon and stars (top-left).
  ctx.fillStyle = p.night;
  rr(ctx, 40, 50, 190, 210, 8);
  ctx.fill();
  ctx.fillStyle = p.nightLight;
  ctx.fillRect(48, 58, 174, 194);
  ctx.strokeStyle = p.wood;
  ctx.lineWidth = 8;
  rr(ctx, 40, 50, 190, 210, 8);
  ctx.stroke();
  ctx.lineWidth = 4;
  line(ctx, 135, 54, 135, 256);
  line(ctx, 44, 155, 226, 155);
  // Moon: a crescent on the left, a full disc on the right.
  ctx.fillStyle = p.moon;
  circle(ctx, 130, 118, 26);
  ctx.fill();
  if (!diffs.has('moon-full')) {
    ctx.fillStyle = p.nightLight;
    circle(ctx, 140, 110, 22);
    ctx.fill();
  }
  star(ctx, 88, 82, 7, p.star);
  star(ctx, 162, 72, 5, p.star);
  star(ctx, 205, 132, 6, p.star);
  if (diffs.has('star-extra')) star(ctx, 192, 92, 6, p.star);
  // A sleepy hill under the window.
  ctx.fillStyle = '#24365e';
  ctx.beginPath();
  ctx.moveTo(48, 252);
  ctx.quadraticCurveTo(130, 205, 222, 252);
  ctx.closePath();
  ctx.fill();

  // Wall clock (top-right).
  clockFace(ctx, 480, 128, 52, diffs.has('clock-time') ? 10 : 9, diffs.has('clock-time') ? 10 : 0);
  ctx.strokeStyle = p.wood;
  ctx.lineWidth = 5;
  line(ctx, 480, 180, 480, 196);
  circle(ctx, 480, 198, 5);
  ctx.fillStyle = p.accent;
  ctx.fill();

  // Hanging lamp (top-centre).
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 3;
  line(ctx, 300, 0, 300, 70);
  ctx.fillStyle = diffs.has('lamp-shade') ? '#3f7d7a' : p.accentSoft;
  ctx.beginPath();
  ctx.moveTo(268, 70);
  ctx.lineTo(332, 70);
  ctx.lineTo(318, 116);
  ctx.lineTo(282, 116);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3220';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,233,168,0.5)';
  ellipse(ctx, 300, 118, 26, 6);
  ctx.fill();

  // Framed picture: a fish on the left, a bird on the right.
  ctx.fillStyle = p.wood;
  rr(ctx, 250, 120, 110, 100, 6);
  ctx.fill();
  ctx.fillStyle = '#bcd6e8';
  rr(ctx, 258, 128, 94, 84, 4);
  ctx.fill();
  if (!diffs.has('picture')) {
    // A little orange fish.
    ctx.fillStyle = '#e8862e';
    ellipse(ctx, 305, 170, 26, 13);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(328, 170);
    ctx.lineTo(346, 158);
    ctx.lineTo(346, 182);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    circle(ctx, 288, 166, 2.5);
    ctx.fill();
  } else {
    // A little blue bird.
    ctx.fillStyle = '#4a7fb5';
    ellipse(ctx, 305, 172, 22, 15);
    ctx.fill();
    circle(ctx, 322, 156, 10);
    ctx.fill();
    ctx.fillStyle = '#e8a34c';
    ctx.beginPath();
    ctx.moveTo(331, 156);
    ctx.lineTo(342, 159);
    ctx.lineTo(331, 162);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    circle(ctx, 325, 153, 2);
    ctx.fill();
    ctx.strokeStyle = '#4a7fb5';
    ctx.lineWidth = 3;
    line(ctx, 296, 184, 288, 196);
    line(ctx, 306, 186, 304, 198);
  }

  // Wall shelf with a candle (left).
  ctx.fillStyle = p.wood;
  ctx.fillRect(40, 296, 160, 10);
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 162, 316, 14, 26, 3);
  ctx.fill();
  if (!diffs.has('candle-flame')) flame(ctx, 169, 314, t);
  else {
    ctx.strokeStyle = 'rgba(120,120,120,0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(169, 314);
    ctx.quadraticCurveTo(174, 302, 169, 292);
    ctx.stroke();
  }

  // Side table with the teapot (left).
  ctx.fillStyle = p.wood;
  ctx.fillRect(60, 380, 150, 12);
  ctx.fillRect(72, 392, 10, 78);
  ctx.fillRect(188, 392, 10, 78);
  ctx.fillStyle = p.accent;
  ellipse(ctx, 135, 372, 34, 22);
  ctx.fill();
  ctx.fillStyle = p.accentSoft;
  ellipse(ctx, 135, 356, 20, 10);
  ctx.fill();
  ctx.fillStyle = p.woodDark;
  circle(ctx, 135, 348, 5);
  ctx.fill();
  if (!diffs.has('teapot-spout')) {
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(164, 366);
    ctx.quadraticCurveTo(188, 372, 186, 392);
    ctx.stroke();
  }
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(104, 362);
  ctx.quadraticCurveTo(92, 372, 100, 384);
  ctx.stroke();

  // Bookshelf (right) with three shelves of books.
  ctx.fillStyle = p.wood;
  ctx.fillRect(430, 280, 150, 190);
  ctx.fillStyle = p.woodDark;
  ctx.fillRect(438, 288, 134, 176);
  const shelfBooks = [
    ['#a03d2d', '#c96f2e', '#4d7a3a', '#3f5a8a', '#7a4a8a'],
    ['#3f5a8a', '#a03d2d', '#c9a227', '#4d7a3a', '#8a6f4d'],
    ['#7a4a8a', '#4d7a3a', '#a03d2d', '#c96f2e', '#3f5a8a'],
  ];
  shelfBooks.forEach((row, ri) => {
    const y = 296 + ri * 58;
    let x = 444;
    row.forEach((color, ci) => {
      // The third book on the middle shelf is the one that changes colour.
      const c = ri === 1 && ci === 2 && diffs.has('book-color') ? '#4d7a3a' : color;
      book(ctx, x, y, 20, 44, ri === 1 && ci === 2 && !diffs.has('book-color') ? '#c0392b' : c);
      x += 24;
    });
    ctx.fillStyle = p.wood;
    ctx.fillRect(438, y + 46, 134, 6);
  });

  // Rug (centre-bottom) with a centre stripe.
  ctx.fillStyle = p.rug;
  ellipse(ctx, 330, 540, 175, 52);
  ctx.fill();
  ctx.strokeStyle = '#e8c88a';
  ctx.lineWidth = 3;
  ellipse(ctx, 330, 540, 150, 42);
  ctx.stroke();
  if (!diffs.has('rug-stripe')) {
    ctx.strokeStyle = '#e8c88a';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(330, 540, 120, 30, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Sleeping cat curled on the rug.
  ctx.fillStyle = p.cat;
  ellipse(ctx, 300, 512, 52, 26);
  ctx.fill();
  circle(ctx, 258, 500, 20);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(244, 488);
  ctx.lineTo(240, 472);
  ctx.lineTo(252, 482);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(266, 484);
  ctx.lineTo(270, 468);
  ctx.lineTo(276, 482);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(252, 500, 6, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // Tail curling out to the right, tip white or ginger.
  ctx.strokeStyle = p.cat;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(348, 518);
  ctx.quadraticCurveTo(372, 528, 366, 506);
  ctx.stroke();
  ctx.fillStyle = diffs.has('cat-tail') ? p.cat : '#fdf6e3';
  circle(ctx, 366, 502, 8);
  ctx.fill();

  // Potted plant (bottom-right).
  ctx.fillStyle = p.plant;
  const leaves = diffs.has('plant-leaf') ? 4 : 5;
  for (let i = 0; i < leaves; i += 1) {
    const a = -Math.PI / 2 + (i - (leaves - 1) / 2) * 0.42;
    ctx.beginPath();
    ctx.ellipse(522 + Math.cos(a) * 26, 470 + Math.sin(a) * 30, 12, 30, a + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = p.accent;
  ctx.beginPath();
  ctx.moveTo(496, 500);
  ctx.lineTo(548, 500);
  ctx.lineTo(540, 548);
  ctx.lineTo(504, 548);
  ctx.closePath();
  ctx.fill();

  // Wooden chest (bottom-left) with a brass key.
  ctx.fillStyle = p.wood;
  rr(ctx, 30, 500, 150, 72, 8);
  ctx.fill();
  ctx.fillStyle = p.woodDark;
  rr(ctx, 30, 500, 150, 22, 8);
  ctx.fill();
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(96, 500, 12, 72);
  if (!diffs.has('chest-key')) {
    ctx.fillStyle = '#e0bc5a';
    circle(ctx, 105, 502, 7);
    ctx.fill();
    ctx.strokeStyle = '#e0bc5a';
    ctx.lineWidth = 4;
    line(ctx, 105, 502, 105, 488);
    line(ctx, 105, 492, 112, 492);
    line(ctx, 105, 497, 112, 497);
  }
}

/* ---------- Room 2: The Old Study ---------- */

function paintStudy(ctx, p, diffs, t) {
  wall(ctx, p, 470);
  floor(ctx, p, 470);

  // Window with curtains and a telescope (top-left).
  ctx.fillStyle = p.night;
  rr(ctx, 40, 50, 190, 200, 8);
  ctx.fill();
  ctx.fillStyle = p.nightLight;
  ctx.fillRect(48, 58, 174, 184);
  ctx.strokeStyle = p.wood;
  ctx.lineWidth = 8;
  rr(ctx, 40, 50, 190, 200, 8);
  ctx.stroke();
  star(ctx, 90, 90, 6, p.star);
  star(ctx, 170, 80, 5, p.star);
  star(ctx, 200, 140, 6, p.star);
  ctx.fillStyle = p.moon;
  circle(ctx, 120, 120, 18);
  ctx.fill();
  // Curtains: tied back on the left, hanging free on the right.
  ctx.fillStyle = '#7a2e35';
  if (!diffs.has('curtain-tie')) {
    ctx.beginPath();
    ctx.moveTo(40, 50);
    ctx.lineTo(78, 50);
    ctx.lineTo(70, 250);
    ctx.lineTo(40, 250);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(230, 50);
    ctx.lineTo(192, 50);
    ctx.lineTo(200, 250);
    ctx.lineTo(230, 250);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillRect(40, 50, 34, 200);
    ctx.fillRect(196, 50, 34, 200);
  }
  // Telescope on the sill: up at the sky, or pointing down.
  ctx.strokeStyle = '#8a6f4d';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  if (!diffs.has('telescope-angle')) line(ctx, 120, 240, 196, 168);
  else line(ctx, 120, 240, 196, 226);
  ctx.fillStyle = p.accent;
  circle(ctx, 120, 240, 8);
  ctx.fill();

  // Portrait (centre wall): eyes open or closed.
  ctx.fillStyle = p.wood;
  rr(ctx, 250, 90, 120, 130, 6);
  ctx.fill();
  ctx.fillStyle = '#d9c9a8';
  rr(ctx, 258, 98, 104, 114, 4);
  ctx.fill();
  ctx.fillStyle = '#e8c9a0';
  circle(ctx, 310, 150, 24);
  ctx.fill();
  ctx.fillStyle = '#8a6f4d';
  ctx.beginPath();
  ctx.arc(310, 132, 24, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#3a2a18';
  if (!diffs.has('portrait-eyes')) {
    circle(ctx, 301, 148, 3);
    ctx.fill();
    circle(ctx, 319, 148, 3);
    ctx.fill();
  } else {
    ctx.lineWidth = 2;
    line(ctx, 296, 148, 306, 148);
    line(ctx, 314, 148, 324, 148);
  }
  ctx.strokeStyle = '#8a4a3a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(310, 162, 7, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();

  // Bookshelf (top-right).
  ctx.fillStyle = p.wood;
  ctx.fillRect(430, 60, 150, 220);
  ctx.fillStyle = p.woodDark;
  ctx.fillRect(438, 68, 134, 204);
  const rows = [
    ['#7a2e35', '#c9a227', '#3f5a8a', '#4d7a3a', '#8a6f4d'],
    ['#3f5a8a', '#7a2e35', '#c9a227', '#8a6f4d', '#4d7a3a'],
    ['#4d7a3a', '#3f5a8a', '#7a2e35', '#c9a227', '#8a6f4d'],
  ];
  rows.forEach((row, ri) => {
    const y = 76 + ri * 66;
    let x = 444;
    row.forEach((color) => {
      book(ctx, x, y, 20, 50, color);
      x += 24;
    });
    ctx.fillStyle = p.wood;
    ctx.fillRect(438, y + 52, 134, 6);
  });

  // Globe on a stand (centre).
  ctx.fillStyle = p.wood;
  ctx.fillRect(296, 372, 8, 40);
  ctx.fillStyle = '#2c4a6e';
  circle(ctx, 300, 330, 42);
  ctx.fill();
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#7fae62';
  if (!diffs.has('globe-land')) {
    // The Americas.
    ellipse(ctx, 288, 316, 12, 18);
    ctx.fill();
    ellipse(ctx, 306, 344, 10, 14);
    ctx.fill();
  } else {
    // Africa and Europe.
    ellipse(ctx, 302, 322, 14, 20);
    ctx.fill();
    ellipse(ctx, 284, 306, 8, 8);
    ctx.fill();
  }
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 330, 42, -0.6, 0.9);
  ctx.stroke();

  // Fireplace (bottom-right) with a mantel clock.
  ctx.fillStyle = '#6e3a2e';
  ctx.fillRect(420, 400, 160, 180);
  ctx.fillStyle = '#8a4a3a';
  for (let y = 410; y < 570; y += 24) {
    for (let x = 420; x < 580; x += 40) line(ctx, x, y, x + 40, y);
  }
  ctx.fillStyle = p.wood;
  ctx.fillRect(412, 388, 176, 14);
  ctx.fillStyle = '#1a1a1a';
  rr(ctx, 452, 452, 96, 128, 10);
  ctx.fill();
  const flameScale = diffs.has('fire-size') ? 0.55 : 1 + Math.sin(t * 6) * 0.08;
  const flameTop = 560 - 95 * flameScale;
  ctx.fillStyle = '#e8862e';
  ctx.beginPath();
  ctx.moveTo(500, 560);
  ctx.quadraticCurveTo(470, 520, 500, flameTop);
  ctx.quadraticCurveTo(530, 520, 500, 560);
  ctx.fill();
  ctx.fillStyle = '#f6c945';
  ctx.beginPath();
  ctx.moveTo(500, 560);
  ctx.quadraticCurveTo(482, 530, 500, flameTop + 30);
  ctx.quadraticCurveTo(518, 530, 500, 560);
  ctx.fill();
  // Mantel clock on the mantel shelf.
  ctx.fillStyle = p.accent;
  rr(ctx, 482, 356, 36, 32, 4);
  ctx.fill();
  ctx.fillStyle = '#fdf6e3';
  circle(ctx, 500, 372, 12);
  ctx.fill();
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 2;
  circle(ctx, 500, 372, 12);
  ctx.stroke();
  const mHour = diffs.has('mantel-clock') ? 4.5 : 3;
  const mMin = diffs.has('mantel-clock') ? 30 : 0;
  const mha = (mHour / 12) * Math.PI * 2;
  const mma = (mMin / 60) * Math.PI * 2;
  ctx.lineWidth = 2;
  line(ctx, 500, 372, 500 + Math.sin(mha) * 6, 372 - Math.cos(mha) * 6);
  line(ctx, 500, 372, 500 + Math.sin(mma) * 9, 372 - Math.cos(mma) * 9);

  // Desk (bottom-left) with inkwell, quill, book stack and candle.
  ctx.fillStyle = p.wood;
  ctx.fillRect(40, 400, 180, 12);
  ctx.fillRect(52, 412, 10, 88);
  ctx.fillRect(198, 412, 10, 88);
  // Book stack: top book tilted or straight.
  ctx.fillStyle = '#7a2e35';
  ctx.fillRect(96, 384, 64, 10);
  ctx.fillStyle = '#3f5a8a';
  if (!diffs.has('book-tilt')) ctx.fillRect(100, 374, 56, 10);
  else {
    ctx.save();
    ctx.translate(128, 379);
    ctx.rotate(0.16);
    ctx.fillRect(-28, -5, 56, 10);
    ctx.restore();
  }
  // Inkwell with its cap on or off.
  ctx.fillStyle = '#1a1a1a';
  circle(ctx, 92, 392, 9);
  ctx.fill();
  if (!diffs.has('inkwell-cap')) {
    ctx.fillStyle = '#c9a227';
    rr(ctx, 84, 380, 16, 6, 2);
    ctx.fill();
  }
  // Quill: white or black feather.
  ctx.strokeStyle = diffs.has('quill-color') ? '#2a2a2a' : '#fdf6e3';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(172, 398);
  ctx.quadraticCurveTo(186, 380, 178, 362);
  ctx.stroke();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  line(ctx, 172, 398, 178, 362);
  // Desk candle: lit or blown out.
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 200, 388, 12, 22, 3);
  ctx.fill();
  if (!diffs.has('candle-desk')) flame(ctx, 206, 386, t, 0.8);
  else {
    ctx.strokeStyle = 'rgba(200,200,200,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(206, 386);
    ctx.quadraticCurveTo(210, 376, 206, 368);
    ctx.stroke();
  }

  // Armchair (bottom-centre) with a cushion.
  ctx.fillStyle = '#5d2f36';
  rr(ctx, 230, 430, 150, 150, 16);
  ctx.fill();
  ctx.fillStyle = '#7a2e35';
  rr(ctx, 244, 444, 122, 70, 12);
  ctx.fill();
  ctx.fillStyle = diffs.has('cushion-dots') ? '#e8c88a' : '#c9a227';
  rr(ctx, 262, 478, 86, 46, 8);
  ctx.fill();
  if (!diffs.has('cushion-dots')) {
    ctx.fillStyle = '#7a2e35';
    for (const [dx, dy] of [[282, 492], [310, 492], [338, 492], [296, 510], [324, 510]]) {
      circle(ctx, dx, dy, 4);
      ctx.fill();
    }
  }

  // Rug (bottom-centre) with a folded corner.
  ctx.fillStyle = p.rug;
  ellipse(ctx, 300, 566, 130, 30);
  ctx.fill();
  ctx.strokeStyle = '#e8c88a';
  ctx.lineWidth = 3;
  ellipse(ctx, 300, 566, 112, 22);
  ctx.stroke();
  if (diffs.has('rug-fold')) {
    ctx.fillStyle = '#8a4a3a';
    ctx.beginPath();
    ctx.moveTo(400, 552);
    ctx.lineTo(428, 566);
    ctx.lineTo(404, 580);
    ctx.closePath();
    ctx.fill();
  }
}

/* ---------- Room 3: The Potting Shed ---------- */

function paintShed(ctx, p, diffs, t) {
  wall(ctx, p, 470);
  floor(ctx, p, 470);

  // Window with the garden, sun and a bird on the sill (top-centre).
  ctx.fillStyle = p.nightLight;
  rr(ctx, 210, 50, 180, 200, 8);
  ctx.fill();
  ctx.strokeStyle = p.wood;
  ctx.lineWidth = 8;
  rr(ctx, 210, 50, 180, 200, 8);
  ctx.stroke();
  ctx.lineWidth = 4;
  line(ctx, 300, 54, 300, 246);
  line(ctx, 214, 150, 386, 150);
  // Sun with eight rays, or six.
  ctx.fillStyle = p.moon;
  circle(ctx, 300, 118, 22);
  ctx.fill();
  ctx.strokeStyle = p.moon;
  ctx.lineWidth = 4;
  const rays = diffs.has('sun-rays') ? 6 : 8;
  for (let i = 0; i < rays; i += 1) {
    const a = (i / rays) * Math.PI * 2;
    line(ctx, 300 + Math.sin(a) * 28, 118 - Math.cos(a) * 28, 300 + Math.sin(a) * 38, 118 - Math.cos(a) * 38);
  }
  // Garden hills and flowers.
  ctx.fillStyle = '#5d8a4a';
  ctx.beginPath();
  ctx.moveTo(214, 246);
  ctx.quadraticCurveTo(300, 200, 386, 246);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e86a8a';
  circle(ctx, 250, 226, 5);
  ctx.fill();
  circle(ctx, 340, 230, 5);
  ctx.fill();
  // Butterfly by the window, or gone.
  if (!diffs.has('butterfly')) {
    ctx.fillStyle = '#8a6fd8';
    ellipse(ctx, 232, 84, 8, 6);
    ctx.fill();
    ellipse(ctx, 246, 84, 8, 6);
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    circle(ctx, 239, 86, 2);
    ctx.fill();
  }
  // Bird on the sill, or gone.
  if (!diffs.has('bird')) {
    ctx.fillStyle = '#4a7fb5';
    ellipse(ctx, 362, 232, 14, 10);
    ctx.fill();
    circle(ctx, 372, 222, 7);
    ctx.fill();
    ctx.fillStyle = '#e8a34c';
    ctx.beginPath();
    ctx.moveTo(378, 222);
    ctx.lineTo(386, 224);
    ctx.lineTo(378, 226);
    ctx.closePath();
    ctx.fill();
  }

  // Shelves (left) with jars and a mug.
  ctx.fillStyle = p.wood;
  for (const y of [140, 240, 340]) ctx.fillRect(40, y, 160, 8);
  const jars = [
    [70, 100, '#e8c88a'], [110, 100, '#c96f2e'], [150, 100, '#7fae62'],
    [70, 200, '#4a7fb5'], [110, 200, '#e8c88a'], [150, 200, '#c96f2e'],
  ];
  for (const [x, y, c] of jars) {
    ctx.fillStyle = c;
    rr(ctx, x, y, 26, 40, 5);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(x + 4, y + 5, 5, 28);
  }
  // The second jar on the top shelf: its label is red or blue.
  ctx.fillStyle = diffs.has('jar-label') ? '#4a7fb5' : '#c0392b';
  ctx.fillRect(112, 116, 22, 12);
  // Mug on the middle shelf: handle there or gone.
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 158, 300, 26, 34, 4);
  ctx.fill();
  if (!diffs.has('mug-handle')) {
    ctx.strokeStyle = '#fdf6e3';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(186, 317, 8, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  // Hanging herbs (top-right): three sprigs or two.
  ctx.strokeStyle = p.woodDark;
  ctx.lineWidth = 4;
  line(ctx, 430, 80, 580, 80);
  const sprigs = diffs.has('herb-sprigs') ? 2 : 3;
  for (let i = 0; i < sprigs; i += 1) {
    const x = 470 + i * 40;
    ctx.strokeStyle = '#8a6f4d';
    ctx.lineWidth = 2;
    line(ctx, x, 80, x, 100);
    ctx.fillStyle = p.plant;
    for (let j = 0; j < 4; j += 1) {
      ellipse(ctx, x, 108 + j * 12, 7, 10);
      ctx.fill();
    }
  }

  // Wall thermometer (right edge): mercury high or low.
  ctx.fillStyle = '#fdf6e3';
  rr(ctx, 560, 260, 14, 100, 7);
  ctx.fill();
  ctx.fillStyle = '#c0392b';
  circle(ctx, 567, 352, 9);
  ctx.fill();
  ctx.fillRect(564, diffs.has('thermometer') ? 330 : 296, 6, diffs.has('thermometer') ? 24 : 58);
  ctx.strokeStyle = '#3a2a18';
  ctx.lineWidth = 1;
  for (let y = 270; y <= 340; y += 14) line(ctx, 574, y, 570, y);

  // Work bench (bottom).
  ctx.fillStyle = p.wood;
  ctx.fillRect(40, 430, 520, 12);
  ctx.fillRect(56, 442, 12, 118);
  ctx.fillRect(532, 442, 12, 118);

  // Flower pots on the bench: the first flower is pink or yellow.
  for (const [px, flower] of [[150, diffs.has('flower-color') ? '#f6c945' : '#e86a8a'], [300, '#e86a8a']]) {
    ctx.fillStyle = p.plant;
    for (let i = 0; i < 3; i += 1) {
      const a = -Math.PI / 2 + (i - 1) * 0.5;
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(a) * 16, 400 + Math.sin(a) * 16, 8, 20, a + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = flower;
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      circle(ctx, px + Math.cos(a) * 7, 384 + Math.sin(a) * 7, 5);
      ctx.fill();
    }
    ctx.fillStyle = '#f6c945';
    circle(ctx, px, 384, 4);
    ctx.fill();
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.moveTo(px - 22, 408);
    ctx.lineTo(px + 22, 408);
    ctx.lineTo(px + 16, 440);
    ctx.lineTo(px - 16, 440);
    ctx.closePath();
    ctx.fill();
  }

  // Watering can: the rose head on the spout, or off.
  ctx.fillStyle = '#7fae62';
  rr(ctx, 440, 448, 46, 34, 8);
  ctx.fill();
  ctx.strokeStyle = '#7fae62';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(486, 460);
  ctx.quadraticCurveTo(500, 462, 500, 474);
  ctx.stroke();
  if (!diffs.has('watering-rose')) {
    ctx.fillStyle = '#5d8a4a';
    circle(ctx, 500, 476, 7);
    ctx.fill();
    ctx.fillStyle = '#3a2a18';
    for (const [dx, dy] of [[-3, -3], [3, -3], [0, 0], [-3, 3], [3, 3]]) {
      circle(ctx, 500 + dx, 476 + dy, 1);
      ctx.fill();
    }
  }
  ctx.strokeStyle = '#5d8a4a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(444, 452);
  ctx.quadraticCurveTo(430, 446, 432, 432);
  ctx.stroke();

  // Trowel: handle there or gone.
  ctx.fillStyle = '#c9a9a9';
  ctx.beginPath();
  ctx.moveTo(372, 470);
  ctx.lineTo(392, 470);
  ctx.lineTo(386, 496);
  ctx.lineTo(378, 496);
  ctx.closePath();
  ctx.fill();
  if (!diffs.has('trowel-handle')) {
    ctx.fillStyle = p.woodDark;
    rr(ctx, 376, 448, 10, 24, 4);
    ctx.fill();
  }

  // Basket of carrots: three or two.
  ctx.fillStyle = '#a1764a';
  ctx.beginPath();
  ctx.moveTo(226, 486);
  ctx.lineTo(274, 486);
  ctx.lineTo(266, 522);
  ctx.lineTo(234, 522);
  ctx.closePath();
  ctx.fill();
  const carrots = diffs.has('carrot-count') ? 2 : 3;
  for (let i = 0; i < carrots; i += 1) {
    const x = 238 + i * 12;
    ctx.fillStyle = '#e8862e';
    ctx.beginPath();
    ctx.moveTo(x, 486);
    ctx.lineTo(x + 8, 486);
    ctx.lineTo(x + 4, 470);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = p.plant;
    ellipse(ctx, x + 4, 468, 3, 7);
    ctx.fill();
  }

  // Boots: a pair, or a single boot.
  ctx.fillStyle = '#5d3a1a';
  rr(ctx, 500, 500, 22, 56, 6);
  ctx.fill();
  ctx.fillRect(500, 544, 40, 14);
  if (!diffs.has('boots')) {
    rr(ctx, 528, 500, 22, 56, 6);
    ctx.fill();
    ctx.fillRect(528, 544, 40, 14);
  }
}

/* ---------- entry point ---------- */

/**
 * Paint room `roomIndex` into a 600x600 context. `diffs` is the set of difference ids that
 * are active on this panel (empty for the left panel, all of them for the right one).
 */
export function paintScene(ctx, roomIndex, diffs, t) {
  const room = ROOMS[roomIndex];
  ctx.save();
  ctx.clearRect(0, 0, 600, 600);
  if (roomIndex === 0) paintAttic(ctx, room.palette, diffs, t);
  else if (roomIndex === 1) paintStudy(ctx, room.palette, diffs, t);
  else paintShed(ctx, room.palette, diffs, t);
  ctx.restore();
}

/** The difference ids of a room, as a Set (what the right panel shows). */
export function allDifferences(roomIndex) {
  return new Set(ROOMS[roomIndex].differences.map((d) => d.id));
}
