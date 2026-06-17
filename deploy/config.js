// Production runtime config for fah-stats.
//
// Installed at /var/www/stats.foldingathome.org/html/config.js (served at
// /config.js). It is loaded before the app bundle, so window.fahConfig exists
// before api.js reads it. `make publish` excludes config.js, so releases never
// overwrite it — edit it on the server to repoint the API without rebuilding,
// then hard-reload the page.
window.fahConfig = {
  apiUrl: 'https://api.foldingathome.org'
}
