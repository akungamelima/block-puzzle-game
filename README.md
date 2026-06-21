# 🧩 Block Puzzle Game

A free, browser-based HTML5 block puzzle game — playable on all devices with no download required.

[![Featured on Orynth](https://orynth.dev/api/badge/block-puzzle-game?theme=light&style=default)](https://orynth.dev/projects/block-puzzle-game)

**Live at → [https://blockpuzzlegame.fun](https://blockpuzzlegame.fun)**

## Features

- 🎮 25+ unique block shapes
- 💥 Combo system for multi-line clears
- 📱 Fully responsive — mouse & touchscreen
- 💾 Auto-saves high score locally
- ⚡ Pure HTML5 Canvas — no frameworks, no plugins
- 🆓 100% free, no ads, no registration

## How to Play

1. **Select a block** from the 3 available pieces at the bottom
2. **Place it** on the 10×10 grid by clicking/tapping
3. **Clear rows or columns** by filling them completely
4. **Combo bonus** for clearing multiple lines at once
5. Game ends when no block can fit on the board

## Project Structure

```
block-puzzle-game/
├── index.html      # Main game page (hero, tutorial, game, features)
├── style.css       # Dark theme styling, fully responsive
├── game.js         # HTML5 Canvas game engine
├── privacy.html    # Privacy Policy
├── legal.html      # Terms & Conditions
├── favicon.svg     # Browser icon
├── CNAME           # Custom domain config
├── robots.txt      # SEO crawler config
└── .github/
    └── workflows/
        └── deploy.yml  # Auto-deploy to GitHub Pages
```

## Deployment

This game is deployed via **GitHub Pages** with a custom domain.

Every push to `main` triggers an automatic deployment through GitHub Actions.

## License

© 2024 BlockPuzzle.fun — All rights reserved.
