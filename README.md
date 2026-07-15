# fah-stats

The public statistics site for **[Folding@home](https://foldingathome.org)** —
a fast, read-only SPA that serves donor, team, project and hardware
leaderboards. A from-scratch rebuild of `https://stats.foldingathome.org/`.

The site is a statically built, client-rendered Vue app: nginx serves the
bundle and the browser fetches all data live from the Folding@home API. There is
no app server, no SSR, and no login — every API call is an unauthenticated GET.

## Functionality

- **Home** (`/`) — global totals, a credit-rate chart, top donor/team previews,
  and a "my donor" lookup remembered across visits.
- **Donors** (`/donor`, `/donor/id/:id`, `/donor/name/:name`) — all-time and
  monthly leaderboards plus per-donor profiles (rank, teams, score history).
- **Teams** (`/team`, `/team/:id`) — team leaderboards and profiles with member
  lists and score history.
- **Projects** (`/project`, `/project/:id`) — active project summary and
  per-project details.
- **OS** (`/os`) — operating-system and hardware breakdown (CPUs, GPUs, TFLOPS).
- **Servers** (`/server`) — assignment- and work-server status and project-type
  totals.
- **Credit Log** (`/credit-log`) — credits and compute-hours logged per hour.
- **Tools** (`/tools`) — WU status lookup, recent CPUs, bonus/passkey status,
  and passkey request.
- **Light/dark theme** toggle (light by default), persisted per browser.

## Tech stack

Vue 3 (Options API) · vue-router · Vite · Pug templates · Stylus styles ·
`lucide-vue-next` icons. No Pinia, no TypeScript, no SSR. Charts are hand-rolled
SVG. The API host is runtime-configurable via `/config.js` (`window.fahConfig`).

## Development

```sh
npm install
npm run dev        # Vite dev server on http://localhost:3000
npm run build      # production build -> dist/
npm run preview    # serve the built bundle locally
```

For local dev, set the API host in `.env.local` (`VITE_API_URL=...`); in
production the server's `config.js` provides it instead.

## Deployment

`fah-stats` is a static, client-rendered SPA (Vite build → HTML + hashed
JS/CSS). There is **no app server and no SSR**: nginx serves the bundle and the
browser fetches all data live from the Folding@home API. Deploys are an `rsync`
of the build output behind nginx.

Host: `stats.foldingathome.org` → `/var/www/stats.foldingathome.org/html`

### Prerequisites

- Node 18+ and `npm` (build), `rsync` and SSH access to the web host.
- An SSH alias/host for the server, passed as `SERVER=` to `make` (the Makefile
  builds `DEST = $(SERVER):/var/www/stats.foldingathome.org`). Example: `fah`.
- nginx and a TLS certificate for the host (e.g. certbot).

### Build

```sh
make build          # npm install + npm run build  ->  dist/
```

Output: `dist/index.html` (the shell, `no-store`) and `dist/static/*` (hashed,
immutable chunks).

### One-time server setup

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

### Each release

```sh
make publish SERVER=fah
```

This builds and `rsync --delete`s `dist/` into the web root, excluding
`config.js`. `--delete` prunes stale hashed chunks from previous releases while
leaving the server's `config.js` intact. Hard-reload to bypass the cached shell.

### Notes

- **No OAuth / login** — nothing to register; every API call is an
  unauthenticated GET.
- Changing the API host needs no rebuild — edit the server's `config.js` and
  reload.
- `make clean` removes the local `dist/`.
