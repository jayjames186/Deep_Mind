# Deep Mind — your study space

A static, responsive flashcard website for GitHub Pages. No build step, account, or API key required.

## Use it

Open `index.html` in your browser, or serve this folder with any static web server. Create sets, add text and images to either side of a card, study with flip cards, or take multiple-choice quizzes. Edit or delete the included example sets whenever you like.

Your sets and images are saved in IndexedDB in the current browser. Data does not sync between devices or between local and hosted versions. Export a backup before switching browsers, clearing site data, or moving to GitHub Pages. Private browsing may discard data when closed. The site needs no backend. Optional Google Fonts fall back to system fonts when offline.

## Import and export

- **Export CSV** in the library downloads all sets into one CSV file. Within a set, it exports only that set.
- CSV exports preserve set titles, descriptions, card text, and images. Images are stored as base64 data inside image columns so importing the file restores them.
- **Import CSV** accepts a Deep Mind CSV export or a simple two-column CSV with term and definition. An optional header can be `term,definition`, `front,back`, or `question,answer`. Quoted fields support commas, double quotes, and line breaks.
- Full export columns: `set_id,set_title,set_description,term,definition,term_image,definition_image`. Each row represents one card. Sets are grouped by set_id, so sets with identical titles remain separate.
- Imports add new sets; importing a file twice creates duplicates. Existing sets are never overwritten.
- Legacy JSON backups and two-column TSV files can still be imported.
- Images may make CSV files large. Preserve the original exported file for reimport; spreadsheet editors can truncate long image cells. Import files are limited to 100 MB.

Example simple CSV:

```csv
term,definition
Hola,Hello
Gracias,Thank you
```

## Publish on GitHub Pages

1. Create a GitHub repository and upload `index.html`, `style.css`, `deep-mind.css`, `neural-field.svg`, `app.js`, `math.js`, `max.js`, and `.nojekyll` to its root (or push this folder using Git).
2. In repository **Settings → Pages**, select **Deploy from a branch**, branch `main`, folder `/ (root)`, and Save.
3. Open the website URL GitHub shows once deployment completes.

Relative asset paths support both repository Pages sites and custom domains. Your personal study content stays in your browser; it is not committed to the repository. Export on one device and import on another to transfer it.

## Checks

Run `node --check app.js` and `node test.cjs` for JavaScript syntax and import validation checks.

## Math / Algebra

Open **Math** in the sidebar, then choose an Algebra topic: one-step equations, two-step equations, variables on both sides, or the distributive property. Each session generates 10 problems. Foundations uses positive answers; Challenge includes negative numbers and larger coefficients.

Enter a number, decimal, or fraction and check your answer. Incorrect answers can be retried. Reveal up to two hints or open the complete worked solution, including a substitution check. Use the scratch space for working. Session results separate unassisted solutions from problems completed with hints or a revealed solution. Practice progress is session-only and is separate from the saved flashcard library and CSV exports.

Run `node math-test.cjs` to check generated equations, answer parsing, hints, scoring, and session completion.

## 3ds Max workshop

Open **3ds Max** in the sidebar for six lessons covering the modifier stack, polygon operations, edge loops, Chamfer, Symmetry, and UV unwrapping. Each has an exercise to try in 3ds Max, a hint, an expected result, a knowledge check, and an Autodesk reference. Completion is tracked for the current page session. **Export lesson cards CSV** creates a CSV you can import into your study library. The website does not run 3ds Max or inspect your models.
