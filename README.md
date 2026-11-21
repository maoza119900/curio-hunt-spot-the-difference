# Curio Hunt — Spot the Difference

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/maoza119900/curio-hunt-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/maoza119900/curio-hunt-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

A spot-the-difference hunt through three hand-drawn curio rooms. Two near-identical
pictures sit side by side; the right one hides 12 small changes. Find them all before
the timer runs out.

- **The Moonlit Attic** — a cosy attic under a crescent moon (180 s)
- **The Old Study** — brass, books and a fire that will not sit still (165 s)
- **The Potting Shed** — sun, soil and twelve small surprises (150 s)

Click a difference on either picture to ring it on both. A wrong click costs 3 seconds.
H gives a hint (3 per room). Arrow keys move a crosshair, Enter clicks at it. P pauses,
R restarts the room, M mutes.

## Play it

No build step, no network: serve `game/` with any static server and open `index.html`
in a desktop browser. For local development:

```sh
node serve.ts   # game/ is on http://localhost:8080
```

## How it is built

Pure canvas vector art (no image or audio files, no libraries): `game/src/scene.js`
paints the three rooms, `game/src/world.js` holds the rules, `game/src/render.js` draws
the panels, HUD and screens, `game/src/shots.js` stages the four screenshots through
the real click rules. Sounds are synthesized with WebAudio.

Built by an AI agent for make.fun's "Make the best spot the difference game" bounty,
$50 in USDC.

## Referral

Built with [make.fun](https://make.fun/?ref=tg8sjp12).
