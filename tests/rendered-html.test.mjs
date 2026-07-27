import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("keeps the survey fields required for the Vercel deployment", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /asIs/);
  assert.match(page, /toBe/);
  assert.match(page, /minimum-hint/);
  assert.match(page, /length >= 50/);
  assert.match(page, /AI Agent\(Claude Code, Codex 등\) 활용 경험 있음/);
  assert.match(page, /유료 생성형 AI 사용 현황/);
  assert.match(page, /유료 계정 없음/);
  assert.match(page, /paidAiTools/);
  assert.doesNotMatch(page, /codex-preview|react-loading-skeleton/i);
});

test("keeps the server-side Google Apps Script submission route", async () => {
  const route = await readFile(new URL("../app/api/submit/route.ts", import.meta.url), "utf8");
  const integration = await readFile(new URL("../lib/apps-script.ts", import.meta.url), "utf8");
  assert.match(route, /\[AS-IS\]/);
  assert.match(route, /\[TO-BE\]/);
  assert.match(route, /agentPreference: \(payload\.paidAiTools/);
  assert.match(route, /availableDataTools: clean\(payload\.dataSensitivity/);
  assert.match(route, /dataSensitivity: clean\(payload\.successCriteria/);
  assert.match(route, /successCriteria: clean\(payload\.instructorNote/);
  assert.match(route, /instructorNote: ""/);
  assert.match(integration, /process\.env\.APPS_SCRIPT_URL/);
  assert.match(integration, /AbortSignal\.timeout/);
});

test("provides a non-writing Apps Script health check", async () => {
  const route = await readFile(new URL("../app/api/health/route.ts", import.meta.url), "utf8");
  assert.match(route, /connection-check-no-write/);
  assert.match(route, /endpointReachable/);
});
