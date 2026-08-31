import assert from "node:assert/strict";
import test from "node:test";
import { PUBLIC_ROUTES, SITE_ORIGIN, renderRouteHtml } from "../scripts/static-seo.mjs";

const template = `<!doctype html><html><head><link rel="canonical" href="old" /><meta name="description" content="old" /><meta property="og:title" content="old" /><meta property="og:description" content="old" /><meta property="og:url" content="old" /><title>old</title></head><body><div id="root"></div></body></html>`;

test("every public route receives unique crawlable metadata and content", () => {
  const titles = new Set();
  for (const [route, config] of Object.entries(PUBLIC_ROUTES)) {
    const html = renderRouteHtml(template, route, config);
    const canonical = `${SITE_ORIGIN}${route === "/" ? "/" : route}`;
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical.replaceAll("/", "\\/")}"`));
    assert.ok(html.includes(`<title>${config.title}</title>`));
    assert.ok(html.includes(`<h1>${config.heading}</h1>`));
    assert.ok(html.includes(`property="og:url" content="${canonical}"`));
    assert.ok(!titles.has(config.title));
    titles.add(config.title);
  }
});
