import http from "node:http";
import { readFile, stat, watch } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const watchMode = process.argv.includes("--watch");
function build() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["scripts/build.mjs"], {
      cwd: root,
      stdio: "inherit",
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Build exited ${code}`)),
    );
  });
}
await build();
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".md": "text/plain; charset=utf-8",
  ".ts": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};
const port = Number(process.env.PORT || 3000);
const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    let file = path.resolve(root, "dist", "." + pathname);
    if (
      !file.startsWith(path.join(root, "dist") + path.sep) &&
      file !== path.join(root, "dist")
    ) {
      res.writeHead(403);
      return res.end();
    }
    let info;
    try {
      info = await stat(file);
    } catch {}
    if (info?.isDirectory()) {
      if (!pathname.endsWith("/")) {
        res.writeHead(301, {
          Location:
            pathname + "/" + new URL(req.url, "http://localhost").search,
        });
        return res.end();
      }
      file = path.join(file, "index.html");
    }
    let data;
    try {
      data = await readFile(file);
    } catch {
      file = path.join(root, "dist/404.html");
      data = await readFile(file);
      res.statusCode = 404;
    }
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "text/plain; charset=utf-8",
    );
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-cache");
    res.end(data);
  } catch {
    res.writeHead(400);
    res.end("Bad request");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(`Local: http://localhost:${port}/`),
);
if (watchMode) {
  let running = false;
  let again = false;
  const rebuild = async () => {
    if (running) {
      again = true;
      return;
    }
    running = true;
    do {
      again = false;
      try {
        await build();
      } catch (e) {
        console.error(e.message);
      }
    } while (again);
    running = false;
  };
  for (const dir of ["src", "scripts"]) {
    (async () => {
      let timer;
      for await (const event of watch(path.join(root, dir), {
        recursive: true,
      })) {
        clearTimeout(timer);
        timer = setTimeout(rebuild, 150);
      }
    })().catch(console.error);
  }
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => server.close(() => process.exit(0)));
