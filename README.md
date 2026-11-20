# AeroCalc – Aircraft Weight & Navigation Calculator

## Publish on GitHub Pages
1. Create a new GitHub repository.
2. Upload **all files and folders** from this ZIP (keep `index.html`, `sw.js`, `manifest.webmanifest`, and the three PNG icons together in the repository root).
3. Open **Settings → Pages**. Choose **Deploy from a branch**, select `main` and `/(root)`, then Save.
4. Wait for GitHub Pages to publish and open the generated HTTPS URL.

## Install on phones and computers
- **Android / Chrome:** open the published HTTPS site, use the browser menu → Install app (or Add to Home screen).
- **iPhone / iPad:** open the published HTTPS site in Safari → Share → Add to Home Screen.
- **Desktop:** use the Install icon in a supported browser, or bookmark the site.

## Offline behavior
The app shell and calculator code are cached by the service worker. Open the published site once while online, then reload it once so the service worker can take control and cache third-party Leaflet library files. After that, the calculator interface and calculations can reopen offline. The satellite map imagery is provided by Esri over the internet and is **not** packaged for offline use; map backgrounds may be blank offline.

Service workers require HTTPS (GitHub Pages provides HTTPS) or localhost. If you publish under a project repository, keep the files in the repository root and do not change their relative paths.
