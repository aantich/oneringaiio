# OneRing AI Website

## Theme
Based on Lexend template (SaaS/Startup theme by UniStudio).
Original theme source: `/Users/aantich/Dropbox/Dev/themes/!lexend/template`

## Project Structure
- `src/` - Source files (HTML pages, SCSS, JS, assets) - edit these
- `src/main/` - HTML page templates (index.html, etc.)
- `src/assets/scss/` - SCSS source styles
- `src/assets/js/` - JavaScript source
- `src/assets/images/` - Images
- `dist/` - Build output (gitignored, auto-deployed)
- `build.mjs` - Build script
- `vite.config.js` - Vite dev server config
- `.github/workflows/deploy.yml` - GitHub Actions deployment

## Development
- `npm run dev` - Start Vite dev server (port 3000)
- `npm run build` - Build to dist/
- `npm run build:minify` - Build with minification

## Deployment
GitHub Actions automatically builds and deploys to GitHub Pages on push to main.
CNAME and .nojekyll live in `src/` and are copied to `dist/` during build.
