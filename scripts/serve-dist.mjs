import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist", import.meta.url));
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function resolvePath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://localhost:${port}`).pathname);
  const requested = normalize(join(root, pathname));

  if (!requested.startsWith(root)) {
    return join(root, "index.html");
  }

  return pathname === "/" ? join(root, "index.html") : requested;
}

createServer(async (request, response) => {
  const filePath = resolvePath(request.url ?? "/");

  try {
    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] ?? "application/octet-stream",
    });
    response.end(body);
  } catch {
    const fallback = await readFile(join(root, "index.html"));
    response.writeHead(200, { "Content-Type": mimeTypes[".html"] });
    response.end(fallback);
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Casa Nube preview: http://127.0.0.1:${port}`);
});
