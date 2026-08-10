# MAKI Secondary School Website

Official website for **MAKI Secondary School** — Mashati Kasurua, Rombo District, Kilimanjaro, Tanzania.

Built with plain HTML, CSS and vanilla JavaScript. No frameworks, no build step — lightweight and fast on low-end devices.

---

## Pages

| Page | File |
| --- | --- |
| Home | `index.html` |
| About | `about.html` |
| History | `history.html` |
| Academics | `academics.html` |
| Admissions | `admissions.html` |
| Gallery | `gallery.html` |
| News | `news.html` |
| Contact | `contact.html` |
| 404 | `404.html` |

---

## Features

- Sticky glassmorphism header with dropdown menus and mobile hamburger menu
- **Dark mode** toggle (persisted via `localStorage`, respects system preference)
- **EN / SW language toggle** (full bilingual content, persisted)
- Scroll progress bar and back-to-top button
- Reveal-on-scroll animations (disabled under `prefers-reduced-motion`)
- Image gallery: auto-playing slideshow, category filters, keyboard-accessible lightbox
- FAQ accordion, testimonials, Google Maps embed
- Accessible contact form with inline validation (sent to the backend at `POST /api/contact`)
- Lightweight **Node.js + Express backend** that serves the site and stores contact messages
- Optimized images (`assets/img/`) plus thumbnails (`assets/img/thumbs/`)
- `robots.txt` and `sitemap.xml` for SEO

---

## Project structure

```
maki-website-root/
├── *.html                 # one file per page
├── style.css              # all styles (no build step)
├── script.js              # all behavior (vanilla JS, no dependencies)
├── server.js              # Express backend (contact form API + static serving)
├── package.json
├── logo.svg / favicon.svg
├── robots.txt / sitemap.xml
├── assets/
│   └── img/               # optimized photos
│       └── thumbs/        # small previews (grid, homepage)
├── data/                  # created at runtime; stores contact messages
│   └── messages.json
└── scripts/
    └── optimize-images.ps1  # reusable image optimization script
```

---

## Backend (contact form)

The site ships with a small Express backend that serves the static files and
receives contact form submissions. Messages are stored in `data/messages.json`.

```powershell
npm install
npm start
```

Then open http://localhost:3000

- `POST /api/contact` — accepts `{ name, email, message, lang }`, validates the
  input, and appends the message to `data/messages.json`.
- `GET /api/health` — health check.
- `data/`, `server.js`, `package.json` and `node_modules/` are blocked from
  direct download.
- Set `PORT` to change the port (default `3000`).

## Development

To preview without the backend, open any `.html` file directly in a browser, or serve the folder:

```powershell
python -m http.server 8000
```

Note: without the backend running, the contact form will show the "something
went wrong" message instead of submitting.

Validate the script syntax:

```powershell
node --check script.js
node --check server.js
```

## Branding

- Primary: `#004080` (navy)
- Dark: `#002147` (navy dark)
- Accent: `#ffcc00` (gold)
