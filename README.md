# THE WHEEL OF NAMES — v2.0.0

Desktop (Electron) and browser app with a minimalist purple dark/light interface, 1,000 participants, winner history, popup, confetti and **real recorded applause**. Sound is taken from the user-supplied recording and trimmed to about 7 seconds with fades. All assets are local.

## Features
- Add 2–1,000 entries (each nonempty line = one person; full names count once).
- Unbiased random picker (crypto-based when available), or manual result mode in Settings.
- Variable landing point inside the selected sector, with 12% clearance from edges.
- Optional automatic winner removal, plus **Close** and **Remove** announcement buttons.
- Winner history preserved in browser storage until Reset. Reset clears history, **not** the participants.
- Dark by default, optional light theme, audio mute, spinning clicks, confetti and a 7-second local applause clip.
- The original multi-file application source and a deployable browser build in `site/`.

## Start desktop app
Requires Node.js 22+ (LTS recommended) and npm.

```sh
npm install
npm start
```

## Windows executable

```sh
npm run dist:win
```

Successful builds put an installer and a portable `.exe` into `dist/`. Building on Windows is recommended.

## Website
Publish `site/` to any static hosting service. GitHub Pages deployment runs from GitHub Actions on pushes to `main`, after you enable **GitHub Pages → Build and deployment → GitHub Actions** in repository settings. `site/index.html` works as the web entry point, and needs the adjacent `src/` and `assets/` folders.

## GitHub automated releases
The `Windows desktop release` workflow runs manually or when you push a tag like `v2.0.0`. It builds Windows binaries, uploads artifacts, and creates a GitHub release for tags. Repository Actions permissions must allow releases.

## Project structure
- `index.html`: Electron/browser entry point
- `src/styles/main.css`: theme, layout, popup and animations
- `src/scripts/engine.js`: pure winner-selection geometry and unbiased picker
- `src/scripts/sound.js`: applause playback and wheel ticks
- `src/scripts/app.js`: UI, rendering, wheel animation, persistence and confetti
- `assets/audio/applause.mp3`: **shortened supplied applause recording** (not synthesized)
- `desktop/main.cjs`: Electron secure shell
- `site/`: public web deployment files
- `.github/workflows/`: Windows build and GitHub Pages deployment
- `tests/`: algorithm tests

## Responsible use
The result-selection dropdown intentionally supports choosing a specific winner for testing and organizer-controlled demonstrations. **That mode is not random**. Use the Random mode for a fair draw and disclose nonrandom selection where fairness is expected.

## Audio rights
The applause file was supplied by the project owner. Before publicly redistributing the app, verify the right to redistribute the supplied recording, and retain any attribution the original license requires.

## v2.1 UI fix

- Winner popup reduced to 490px maximum width with a smaller winner title and tighter spacing.
- Backdrop reduced from 9px blur to 2px and lighter dimming.
- Confetti now renders above the popup, bursts from either side when the winner is announced, and lasts approximately 5.8 seconds.
- Applause recording and winner-selection behavior are unchanged.

## v2.2 — Brutalist UI and celebration fixes

- Dark theme uses a uniform near-black background with no gradients. Light theme remains available.
- All rectangular cards, modals, buttons and form controls have square corners. The circular spinning wheel stays circular.
- Winner popup is now up to 460px wide with smaller type and reduced padding.
- Winner overlay has no blur and only 30% black dimming.
- Celebration confetti uses a foreground canvas above the dialog, and bursts outward from each side.
- Recorded applause, 1,000-entry support, winner history and wheel algorithms preserved.

## v2.3 visual and confetti fixes
- No popup or primary-button drop shadows; square brutalist panels remain.
- Winner backdrop has no blur and uses only 24% dimming.
- Confetti uses the same `canvas-confetti` library/API shown in the Preline UI docs.
- Source ZIP includes an offline compatible canvas-confetti fallback. `npm install` automatically vendors the **official** `canvas-confetti` distribution for desktop and web builds (no CDN required).
- Confetti starts automatically when a winner is announced, remains visible for several seconds, and is cleared when the popup closes.
- When updating source files for GitHub Pages, run `npm run sync:web`. The Pages workflow does this for you.
