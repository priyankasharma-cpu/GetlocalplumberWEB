// Serve built output plus the development-only responsive harness. Never deploy this server.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../dist/", import.meta.url));
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webp": "image/webp",
  ".xml": "application/xml",
  ".txt": "text/plain",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    if (req.url === "/__services") {
      const records = JSON.parse(
        fs.readFileSync(
          fileURLToPath(new URL("../src/data/services.json", import.meta.url)),
          "utf8",
        ),
      );
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify(records.map((s) => "/services/" + s.slug)));
    }
    let file;
    if (req.url === "/__baseline.css") {
      res.setHeader("Content-Type", "text/css");
      return fs.createReadStream(fileURLToPath(new URL("../test-results/css-refactor/baseline-build/baseline.css", import.meta.url))).pipe(res);
    }
    if (req.url.startsWith("/__css")) {
      res.setHeader("Content-Type", "text/html");
      return fs.createReadStream(fileURLToPath(new URL("../tests/css-regression.html", import.meta.url))).pipe(res);
    }
    if (req.url.startsWith("/__visual")) {
      res.setHeader("Content-Type", "text/html");
      return fs.createReadStream(fileURLToPath(new URL("../tests/visual-review.html", import.meta.url))).pipe(res);
    }
    if (req.url === "/__qa")
      file = fileURLToPath(
        new URL("../tests/responsive.html", import.meta.url),
      );
    else {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      file = path.resolve(root, "." + pathname);
      const relative = path.relative(root, file);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        res.writeHead(403);
        return res.end();
      }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory())
        file = path.join(file, "index.html");
      if (!fs.existsSync(file)) file = path.join(root, "index.html");
    }
    res.setHeader(
      "Content-Type",
      mime[path.extname(file)] || "application/octet-stream",
    );
    fs.createReadStream(file).pipe(res);
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("QA server: http://127.0.0.1:4173/__qa"),
  );
