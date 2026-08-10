/* ==========================================================================
   MAKI SECONDARY SCHOOL - Express backend
   Serves the static site and handles contact form submissions.
   Run with: npm install && npm start
   ========================================================================== */

'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const SITE_DIR = __dirname;
const DATA_DIR = path.join(SITE_DIR, 'data');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

app.use(express.json({ limit: '10kb' }));

const BLOCKED = [
  '/data/',
  '/server.js',
  '/package.json',
  '/package-lock.json',
  '/node_modules/',
  '/.env',
  '/.gitignore'
];

app.use((req, res, next) => {
  const p = path.normalize(req.path).replace(/\\/g, '/');
  if (BLOCKED.some((b) => p === b || p.startsWith(b))) {
    return res.status(404).end();
  }
  next();
});

app.use(express.static(SITE_DIR));

function loadMessages() {
  try {
    return JSON.parse(fs.readFileSync(MESSAGES_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveMessages(messages) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2), 'utf8');
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'maki-backend' });
});

app.post('/api/contact', (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!name || name.length > 120) {
    return res.status(400).json({ ok: false, error: 'name' });
  }
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'email' });
  }
  if (!message || message.length > 5000) {
    return res.status(400).json({ ok: false, error: 'message' });
  }

  const messages = loadMessages();
  messages.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    name: name,
    email: email,
    message: message,
    lang: typeof req.body.lang === 'string' ? req.body.lang : 'en',
    receivedAt: new Date().toISOString()
  });
  saveMessages(messages);

  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(SITE_DIR, '404.html'));
});

app.listen(PORT, () => {
  console.log('MAKI backend running at http://localhost:' + PORT);
});
