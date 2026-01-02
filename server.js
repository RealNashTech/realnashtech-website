const http = require("http");
const fs = require("fs");
const path = require("path");

const DEFAULT_PORT = 3001;
const PORT = (() => {
  const argIndex = process.argv.indexOf("--port");
  if (argIndex !== -1 && process.argv[argIndex + 1]) {
    const parsed = Number(process.argv[argIndex + 1]);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  if (process.env.PORT) {
    const parsed = Number(process.env.PORT);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return DEFAULT_PORT;
})();

const ROOT = __dirname;
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function safeResolve(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const cleanPath = decoded === "/" ? "/index.html" : decoded;
  const resolved = path.normalize(path.join(ROOT, cleanPath));
  if (!resolved.startsWith(ROOT)) {
    return null;
  }
  return resolved;
}

const server = http.createServer((req, res) => {
  const filePath = safeResolve(req.url);
  if (!filePath) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request.");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found.");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Company site running at http://127.0.0.1:${PORT}`);
});
