type AppsScriptResult = {
  ok?: boolean;
  message?: string;
  submissionId?: string;
  duplicate?: boolean;
};

export function getAppsScriptEndpoint() {
  const raw = process.env.APPS_SCRIPT_URL?.trim();
  if (!raw) throw new Error("APPS_SCRIPT_URL 환경변수가 설정되지 않았습니다.");

  const unquoted = raw.replace(/^(['"])(.*)\1$/, "$2").trim();
  const endpoint = new URL(unquoted);
  if (
    endpoint.protocol !== "https:" ||
    endpoint.hostname !== "script.google.com" ||
    !endpoint.pathname.endsWith("/exec")
  ) {
    throw new Error("APPS_SCRIPT_URL 형식이 올바르지 않습니다.");
  }

  return endpoint.toString();
}

export async function postToAppsScript(body: URLSearchParams) {
  const response = await fetch(getAppsScriptEndpoint(), {
    method: "POST",
    body,
    redirect: "follow",
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
  const responseText = await response.text();

  let result: AppsScriptResult;
  try {
    result = JSON.parse(responseText) as AppsScriptResult;
  } catch {
    throw new Error(
      responseText.includes("Google Apps Script")
        ? "Google Apps Script 웹앱의 접근 권한 또는 배포 버전을 확인해 주세요."
        : "Google Apps Script가 올바른 JSON 응답을 반환하지 않았습니다.",
    );
  }

  return { response, result };
}
