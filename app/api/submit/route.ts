import { NextResponse } from "next/server";
import { postToAppsScript } from "@/lib/apps-script";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type SurveyPayload = {
  name?: string;
  company?: string;
  title?: string;
  email?: string;
  aiExperience?: string;
  businessAreas?: string[];
  primaryOutcome?: string;
  usecaseTitle?: string;
  asIs?: string;
  toBe?: string;
  currentPain?: string;
  desiredOutput?: string;
  dataSensitivity?: string;
  successCriteria?: string;
  instructorNote?: string;
  website?: string;
};

const clean = (value: unknown, max = 2000) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SurveyPayload;
    if (payload.website) return NextResponse.json({ ok: true });

    const required = [payload.name, payload.company, payload.title, payload.aiExperience, payload.primaryOutcome, payload.usecaseTitle, payload.currentPain, payload.asIs, payload.toBe, payload.desiredOutput, payload.dataSensitivity, payload.successCriteria];
    if (required.some((value) => !clean(value)) || !payload.businessAreas?.length || clean(payload.asIs).length < 50 || clean(payload.toBe).length < 50) {
      return NextResponse.json({ ok: false, message: "필수 항목을 확인해 주세요." }, { status: 400 });
    }

    const submissionId = crypto.randomUUID();
    const body = new URLSearchParams({
      submissionId,
      name: clean(payload.name, 100),
      company: clean(payload.company, 150),
      title: clean(payload.title, 100),
      email: clean(payload.email, 200),
      aiExperience: clean(payload.aiExperience, 100),
      agentPreference: "",
      businessAreas: (payload.businessAreas || []).slice(0, 3).map((v) => clean(v, 60)).join(", "),
      primaryOutcome: clean(payload.primaryOutcome, 100),
      usecaseTitle: clean(payload.usecaseTitle, 250),
      usecaseDescription: `[AS-IS]\n${clean(payload.asIs, 2000)}\n\n[TO-BE]\n${clean(payload.toBe, 2000)}`,
      currentPain: clean(payload.currentPain, 2000),
      desiredOutput: clean(payload.desiredOutput, 150),
      availableDataTools: "",
      dataSensitivity: clean(payload.dataSensitivity, 100),
      successCriteria: clean(payload.successCriteria, 1000),
      instructorNote: clean(payload.instructorNote, 1500),
    });

    const { response, result } = await postToAppsScript(body);
    if (!response.ok || !result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message || "Google Sheets 저장에 실패했습니다." },
        { status: 502 },
      );
    }
    if (result.submissionId !== submissionId) {
      return NextResponse.json(
        { ok: false, message: "저장 확인 ID가 일치하지 않습니다. 다시 제출해 주세요." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, submissionId });
  } catch (error) {
    console.error("Survey submission failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error
          ? `응답 저장 연결 오류: ${error.message}`
          : "응답을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      },
      { status: 500 },
    );
  }
}
