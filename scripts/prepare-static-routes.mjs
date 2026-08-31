import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PUBLIC_ROUTES, renderRouteHtml } from "./static-seo.mjs";

const dist = path.resolve("dist");
const template = await readFile(path.join(dist, "index.html"), "utf8");
const rendered = new Map(
  Object.entries(PUBLIC_ROUTES).map(([route, config]) => [
    route,
    renderRouteHtml(template, route, config),
  ]),
);

await writeFile(path.join(dist, "index.html"), rendered.get("/"));
await writeFile(path.join(dist, "404.html"), rendered.get("/"));

for (const [route, html] of rendered) {
  if (route === "/") continue;
  const directory = path.join(dist, route.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), html);
}

// Preserve the established static URL while giving it the Ask AI metadata.
await writeFile(path.join(dist, "ask-poly.html"), rendered.get("/ask-ai"));

for (const route of ["auth", "dashboard", "pdf", "lesson", "subject"]) {
  const directory = path.join(dist, route);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, "index.html"), rendered.get("/"));
}
