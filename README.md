# MEV Sandwich Detector – Documentation Portal

A static documentation site (plain HTML, CSS and JavaScript, no build step, no external libraries).

## Run in VS Code
Option 1 (easiest): install the **Live Server** extension, right-click `index.html`, choose *Open with Live Server*.
Option 2: open a terminal in this folder and run `python -m http.server 5500`, then open http://localhost:5500
Option 3: double-click `index.html` (works from the file system too).

## Contents
- `index.html`   all pages (overview, design, evaluation, results, reference)
- `assets/style.css`, `assets/app.js`   styling, routing, search (Ctrl+K or /), charts, theme toggle
- `assets/data.js`   numbers behind the charts and tables, generated from the evaluation CSV files
- `assets/figures/`   the 26 evaluation figures (PNG)

## Notes
- Every number comes from the project's CSV files or the written report. Nothing is estimated.
- No API keys or private keys are included. Keep them in a `.env` file that is not committed.
