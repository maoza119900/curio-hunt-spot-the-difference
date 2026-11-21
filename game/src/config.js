// Every tuning number, palette and difference table in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below depends on the
// screen size. Each room is a 600x600 scene; the two panels show the same room, the right one
// with every difference in its table applied.

export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** Panels: two 600x600 scenes side by side under the HUD. */
export const PANELS = {
  size: 600,
  left: { x: 20, y: 84 },
  right: { x: 660, y: 84 },
  gap: 40,
};

export const HUD = { height: 76 };

export const SCORE = {
  perFind: 100,
  streakBonus: 10,
  hintCost: 50,
  wrongClickSeconds: 3,
  timeBonusPerSecond: 5,
  unusedHintBonus: 100,
};

export const HINTS_PER_ROOM = 3;
export const HINT_SECONDS = 2.5;

/** Seconds the timer shows when a room starts. */
export const ROOM_TIME = [180, 165, 150];

/** A difference: an id, a short name for the dossier outline, and its hit zone in scene coords. */
export const ROOMS = [
  {
    id: 'attic',
    name: 'The Moonlit Attic',
    tagline: 'A cosy attic by moonlight',
    palette: {
      wall: '#ecd9b0', wallDark: '#d9bf8f', floor: '#a97c50', floorDark: '#96683f',
      wood: '#7a5230', woodDark: '#5f3d22', accent: '#c96f2e', accentSoft: '#e8a34c',
      night: '#1d2b4f', nightLight: '#2c3f6e', moon: '#f6e8b8', star: '#ffe9a8',
      cat: '#e08a3c', catDark: '#b96a28', plant: '#4d7a3a', rug: '#a03d2d',
    },
    differences: [
      { id: 'moon-full', name: 'Moon: crescent or full', x: 130, y: 118, r: 32 },
      { id: 'star-extra', name: 'An extra star in the window', x: 192, y: 92, r: 22 },
      { id: 'clock-time', name: 'Clock hands: a different hour', x: 480, y: 128, r: 52 },
      { id: 'book-color', name: 'One book spine changed colour', x: 500, y: 330, r: 24 },
      { id: 'cat-tail', name: 'Cat tail tip: white or ginger', x: 366, y: 502, r: 22 },
      { id: 'teapot-spout', name: 'Teapot spout: there or gone', x: 186, y: 398, r: 24 },
      { id: 'plant-leaf', name: 'Plant: five leaves or four', x: 522, y: 438, r: 26 },
      { id: 'picture', name: 'Picture: a fish or a bird', x: 305, y: 170, r: 36 },
      { id: 'candle-flame', name: 'Candle: lit or blown out', x: 168, y: 342, r: 24 },
      { id: 'rug-stripe', name: 'Rug: centre stripe missing', x: 212, y: 540, r: 24 },
      { id: 'lamp-shade', name: 'Lamp shade: amber or teal', x: 300, y: 93, r: 26 },
      { id: 'chest-key', name: 'Brass key on the chest: there or gone', x: 105, y: 502, r: 24 },
    ],
  },
  {
    id: 'study',
    name: 'The Old Study',
    tagline: 'Brass, books and a restless fire',
    palette: {
      wall: '#33503f', wallDark: '#26402f', floor: '#6b4a2c', floorDark: '#57391f',
      wood: '#4a2f1a', woodDark: '#38220f', accent: '#c9a227', accentSoft: '#e0bc5a',
      night: '#101d18', nightLight: '#1c332a', moon: '#e8e0b8', star: '#ffe9a8',
      cat: '#8a6f4d', catDark: '#6b5335', plant: '#3f6b34', rug: '#5d2f36',
    },
    differences: [
      { id: 'globe-land', name: 'Globe: the Americas or Africa', x: 300, y: 330, r: 46 },
      { id: 'quill-color', name: 'Quill: white feather or black', x: 180, y: 378, r: 18 },
      { id: 'inkwell-cap', name: 'Inkwell cap: on or off', x: 92, y: 430, r: 20 },
      { id: 'fire-size', name: 'Fireplace flame: tall or small', x: 500, y: 498, r: 36 },
      { id: 'mantel-clock', name: 'Mantel clock: a different hour', x: 500, y: 388, r: 28 },
      { id: 'portrait-eyes', name: 'Portrait eyes: open or closed', x: 310, y: 150, r: 30 },
      { id: 'book-tilt', name: 'Top book: tilted or straight', x: 128, y: 392, r: 22 },
      { id: 'telescope-angle', name: 'Telescope: up at the sky or down', x: 170, y: 190, r: 26 },
      { id: 'curtain-tie', name: 'Curtain: tied back or hanging free', x: 222, y: 130, r: 22 },
      { id: 'cushion-dots', name: 'Cushion: dotted or plain', x: 305, y: 500, r: 30 },
      { id: 'rug-fold', name: 'Rug corner: folded or flat', x: 428, y: 564, r: 26 },
      { id: 'candle-desk', name: 'Desk candle: lit or blown out', x: 206, y: 414, r: 20 },
    ],
  },
  {
    id: 'shed',
    name: 'The Potting Shed',
    tagline: 'Sun, soil and small surprises',
    palette: {
      wall: '#a9bd8f', wallDark: '#8fa877', floor: '#b98a5e', floorDark: '#a1764a',
      wood: '#7d5a33', woodDark: '#5f4223', accent: '#c65f33', accentSoft: '#e08a52',
      night: '#7fb069', nightLight: '#a7c98a', moon: '#ffd94d', star: '#fff3b0',
      cat: '#c98a4b', catDark: '#a56a30', plant: '#4d7a3a', rug: '#7a4a3a',
    },
    differences: [
      { id: 'sun-rays', name: 'Sun: eight rays or six', x: 300, y: 118, r: 36 },
      { id: 'bird', name: 'Bird on the sill: there or gone', x: 362, y: 232, r: 22 },
      { id: 'watering-rose', name: 'Watering-can rose: on or off', x: 482, y: 468, r: 26 },
      { id: 'jar-label', name: 'One jar label: red or blue', x: 110, y: 178, r: 22 },
      { id: 'herb-sprigs', name: 'Hanging herbs: three sprigs or two', x: 500, y: 128, r: 28 },
      { id: 'flower-color', name: 'Flower: pink or yellow', x: 150, y: 398, r: 24 },
      { id: 'trowel-handle', name: 'Trowel handle: there or gone', x: 382, y: 480, r: 24 },
      { id: 'boots', name: 'Boots: a pair or a single boot', x: 522, y: 528, r: 28 },
      { id: 'carrot-count', name: 'Basket: three carrots or two', x: 250, y: 498, r: 26 },
      { id: 'butterfly', name: 'Butterfly by the window: there or gone', x: 238, y: 88, r: 20 },
      { id: 'mug-handle', name: 'Mug: handle there or gone', x: 170, y: 278, r: 20 },
      { id: 'thermometer', name: 'Thermometer: high or low', x: 566, y: 310, r: 22 },
    ],
  },
];

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'curio-hunt.best';
