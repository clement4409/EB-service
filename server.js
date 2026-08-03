/* ============================================================
   EB SERVICE â€” Serveur web local (sans dÃ©pendance)
   Lancement : node server.js   (puis ouvrir http://localhost:3000)
   ============================================================ */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.mp4':  'video/mp4',
  '.ico':  'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2':'font/woff2'
};

const server = http.createServer((req, res) => {
  // URL dÃ©codÃ©e + protection contre la traversÃ©e de dossier
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(filePath, (err, stats) => {
    // pas d'extension -> on tente .html (URLs propres)
    if (err && !path.extname(filePath)) {
      filePath += '.html';
    }
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end('<h1 style="font-family:sans-serif">404 â€” Page introuvable</h1><a href="/">Retour Ã  l\'accueil</a>');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
});

server.listen(PORT, () => {
  console.log('\n  ðŸŒ¿  EB SERVICE â€” serveur local dÃ©marrÃ©');
  console.log('  âžœ  http://localhost:' + PORT + '\n');
  console.log('  (Ctrl + C pour arrÃªter)\n');
});
