import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the executive AI hands-on survey", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Executive AI Hands-on \| 사전 준비 설문/i);
  assert.match(html, /이번 세션에서 직접 만들고 싶은/);
  assert.match(html, /STEP/);
  assert.match(html, /OF 3/);
  assert.match(html, /기본 정보/);
  assert.match(html, /약 5분/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
