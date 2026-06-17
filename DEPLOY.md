# Deploying fah-stats

`fah-stats` is a static, client-rendered SPA (Vite build → HTML + hashed
JS/CSS). There is **no app server and no SSR**: nginx serves the bundle and the
browser fetches all data live from the Folding@home API. Deploys are an `rsync`
of the build output behind nginx.

Host: `stats.foldingathome.org` → `/var/www/stats.foldingathome.org/html`

## Prerequisites

- Node 18+ and `npm` (build), `rsync` and SSH access to the web host.
- An SSH alias/host for the server, passed as `SERVER=` to `make` (the Makefile
  builds `DEST = $(SERVER):/var/www/stats.foldingathome.org`). Example: `fah`.
- nginx and a TLS certificate for the host (e.g. certbot).

## Build

```sh
make build          # npm install + npm run build  ->  dist/
```

Output: `dist/index.html` (the shell, `no-store`) and `dist/static/*` (hashed,
immutable chunks).

## One-time server setup

1. **Runtime config** — install `deploy/config.js`, then edit it on the server
   to set the real API host:
   ```sh
   make publish-config SERVER=fah
   # then on the server, edit /var/www/stats.foldingathome.org/html/config.js
   ```
   It currently points at `https://api.foldingathome.org`. `config.js` is loaded
   before the app and is **excluded from `make publish`**, so releases never
   overwrite it. (In local dev there is no `config.js`; `VITE_API_URL` in
   `.env.local` provides the host instead.)

2. **nginx** — install the site config, enable it, test, reload:
   ```sh
   make publish-nginx SERVER=fah
   # on the server:
   ln -s /etc/nginx/sites-available/stats.foldingathome.org \
         /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   ```
   Point the `ssl_certificate*` paths in `deploy/nginx.conf` at the real cert
   (certbot can manage this).

## Each release

```sh
make publish SERVER=fah
```

This builds and `rsync --delete`s `dist/` into the web root, excluding
`config.js`. `--delete` prunes stale hashed chunks from previous releases while
leaving the server's `config.js` intact. Hard-reload to bypass the cached shell.

## Notes

- **No OAuth / login** — nothing to register; every API call is an
  unauthenticated GET.
- Changing the API host needs no rebuild — edit the server's `config.js` and
  reload.
- `make clean` removes the local `dist/`.
