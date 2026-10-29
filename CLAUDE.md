# CLAUDE.md

Coin Dash is a small Phaser 3 browser game (`index.html`, `settings.js`, `game.js`, `vendor/phaser-3.90.0.min.js`).
Several people develop features in parallel, each with Claude Code. Follow these rules so their work does not collide.

## Where features go

- Every new feature lives in its own directory: `features/<feature_name>/`, in snake_case
  (for example `features/dark_mode/`, `features/pause_key/`).
- Put all of the feature's code, styles and notes inside that directory. Do not put feature code in the repository root.
- Before you create a feature directory, check that the name is not already taken. Never edit another feature's directory
  unless the user asks you to.

## Shared files

- Keep changes to shared files (`index.html`, `game.js`, `settings.js`, `style.css`) as small as possible:
  only the lines needed to load or hook in the feature, for example one `<script src="features/<feature_name>/...">` line in `index.html`.
- Do not reformat, reorder or rewrite code in shared files that the feature does not need to touch.
- Do not change `vendor/`.

## Git

- Work on a branch named `feature/<feature_name>`, not directly on `main`.
- Pull the latest `main` before starting, and before merging.
