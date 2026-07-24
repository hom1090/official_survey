import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the survey fields required for the Vercel deployment", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /asIs/);
  assert.match(page, /toBe/);
  assert.match(page, /minimum-hint/);
  assert.match(page, /length >= 50/);
  assert.doesNotMatch(page, /codex-preview|react-loading-skeleton/i);
});

test("keeps the server-side Google Apps Script submission route", async () => {
  const route = await readFile(new URL("../app/api/submit/route.ts", import.meta.url), "utf8");
  assert.match(route, /process\.env\.APPS_SCRIPT_URL/);
  assert.match(route, /\[AS-IS\]/);
  assert.match(route, /\[TO-BE\]/);
});
