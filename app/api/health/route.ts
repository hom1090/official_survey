import { NextResponse } from "next/server";
import { postToAppsScript } from "@/lib/apps-script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    const { response, result } = await postToAppsScript(
      new URLSearchParams({ submissionId: "connection-check-no-write" }),
    );

    return NextResponse.json({
      ok: response.ok && result.ok === false,
      endpointConfigured: true,
      endpointReachable: response.ok,
      appsScriptResponded: typeof result.message === "string",
    });
  } catch (error) {
    console.error("Apps Script health check failed", error);
    return NextResponse.json(
      {
        ok: false,
        endpointConfigured: Boolean(process.env.APPS_SCRIPT_URL),
        endpointReachable: false,
        message: error instanceof Error ? error.message : "연결 상태를 확인하지 못했습니다.",
      },
      { status: 503 },
    );
  }
}
