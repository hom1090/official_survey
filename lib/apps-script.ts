type AppsScriptResult = {
  ok?: boolean;
  message?: string;
  submissionId?: string;
  duplicate?: boolean;
};

type AppsScriptDiagnostics = {
  initialStatus: number;
  initialContentType: string | null;
  redirected: boolean;
  finalStatus: number;
  finalContentType: string | null;
  finalHost: string;
  bodyType: "json" | "html" | "text" | "empty";
  pageTitle?: string;
};

export class AppsScriptResponseError extends Error {
  diagnostics: AppsScriptDiagnostics;

  constructor(message: string, diagnostics: AppsScriptDiagnostics) {
    super(message);
    this.name = "AppsScriptResponseError";
    this.diagnostics = diagnostics;
  }
}

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
  let response = await fetch(getAppsScriptEndpoint(), {
    method: "POST",
    body,
    redirect: "manual",
    cache: "no-store",
    signal: AbortSignal.timeout(25_000),
  });
  const initialStatus = response.status;
  const initialContentType = response.headers.get("content-type");
  let redirected = false;

  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("location");
    if (!location) throw new Error("Google Apps Script 리디렉션 주소가 없습니다.");

    const redirectUrl = new URL(location);
    if (
      redirectUrl.protocol !== "https:" ||
      redirectUrl.hostname !== "script.googleusercontent.com"
    ) {
      throw new Error("Google Apps Script 리디렉션 주소가 올바르지 않습니다.");
    }

    response = await fetch(redirectUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(25_000),
    });
    redirected = true;
  }

  const responseText = await response.text();

  let result: AppsScriptResult;
  try {
    result = JSON.parse(responseText) as AppsScriptResult;
  } catch {
    const trimmed = responseText.trim();
    const isHtml = /^<!doctype html|^<html/i.test(trimmed);
    const pageTitle = isHtml
      ? trimmed.match(/<title[^>]*>([^<]{1,120})<\/title>/i)?.[1]?.trim()
      : undefined;
    throw new AppsScriptResponseError(
      responseText.includes("Google Apps Script")
        ? "Google Apps Script 웹앱의 접근 권한 또는 배포 버전을 확인해 주세요."
        : "Google Apps Script가 올바른 JSON 응답을 반환하지 않았습니다.",
      {
        initialStatus,
        initialContentType,
        redirected,
        finalStatus: response.status,
        finalContentType: response.headers.get("content-type"),
        finalHost: new URL(response.url).hostname,
        bodyType: !trimmed ? "empty" : isHtml ? "html" : "text",
        ...(pageTitle ? { pageTitle } : {}),
      },
    );
  }

  return { response, result };
}
