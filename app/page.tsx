"use client";

import { FormEvent, useMemo, useState } from "react";

const paidAiToolOptions = ["GPT", "Claude", "Gemini", "직접입력", "유료 계정 없음"];

const businessAreas = [
  "전략·기획",
  "영업·마케팅",
  "고객·서비스",
  "운영·생산",
  "재무·리스크",
  "HR·조직",
  "R&D·데이터",
  "직접입력",
];

const examples = [
  {
    area: "전략·기획",
    title: "주간 경영회의 의사결정 브리프 자동 작성",
    detail:
      "사업부별 실적 자료와 주요 이슈를 읽고, 변동 원인·리스크·의사결정이 필요한 항목을 1페이지 브리프로 정리하고 싶습니다.",
    output: "경영진 보고서·브리프",
  },
  {
    area: "영업·마케팅",
    title: "핵심 고객 미팅 준비 에이전트",
    detail:
      "고객사 정보, 과거 미팅 기록, 최근 제안서를 바탕으로 다음 미팅의 질문 목록과 제안 방향, 예상 반론을 준비하고 싶습니다.",
    output: "고객 미팅 준비 자료",
  },
  {
    area: "고객·서비스",
    title: "VOC에서 반복 이슈와 개선 과제 찾기",
    detail:
      "상담 기록과 고객 의견을 분류해 반복되는 불편, 영향이 큰 원인, 바로 실행할 개선 과제를 우선순위로 제안받고 싶습니다.",
    output: "VOC 분석 리포트",
  },
  {
    area: "운영·생산",
    title: "업무 규정 기반 운영 점검 도우미",
    detail:
      "사내 규정과 체크리스트를 기준으로 현장 보고서를 검토하고, 누락·위험 신호·후속 조치 담당자를 표로 정리하고 싶습니다.",
    output: "점검표·액션 리스트",
  },
  {
    area: "재무·리스크",
    title: "계약서 핵심 리스크 사전 검토",
    detail:
      "표준 계약 조건과 신규 계약서를 비교해 비표준 조항, 금액·기한 관련 리스크, 법무 검토가 필요한 부분을 표시하고 싶습니다.",
    output: "리스크 검토 메모",
  },
  {
    area: "HR·조직",
    title: "조직 진단 인터뷰 인사이트 정리",
    detail:
      "리더 인터뷰 메모를 익명화해 공통된 조직 이슈, 관점 차이, 다음 워크숍에서 논의할 질문을 도출하고 싶습니다.",
    output: "조직 인사이트 요약",
  },
];

type FormState = {
  name: string;
  company: string;
  title: string;
  email: string;
  aiExperience: string;
  paidAiTools: string[];
  paidAiToolOther: string;
  businessAreas: string[];
  businessAreaOther: string;
  primaryOutcome: string;
  primaryOutcomeOther: string;
  usecaseTitle: string;
  asIs: string;
  toBe: string;
  currentPain: string;
  desiredOutput: string;
  desiredOutputOther: string;
  dataSensitivity: string;
  successCriteria: string;
  instructorNote: string;
  website: string;
};

const initialForm: FormState = {
  name: "",
  company: "",
  title: "",
  email: "",
  aiExperience: "",
  paidAiTools: [],
  paidAiToolOther: "",
  businessAreas: [],
  businessAreaOther: "",
  primaryOutcome: "",
  primaryOutcomeOther: "",
  usecaseTitle: "",
  asIs: "",
  toBe: "",
  currentPain: "",
  desiredOutput: "",
  desiredOutputOther: "",
  dataSensitivity: "",
  successCriteria: "",
  instructorNote: "",
  website: "",
};

function FieldLabel({ children, optional = false }: { children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="field-label">
      <span>{children}</span>
      {optional ? <span className="optional">선택</span> : <span className="required">필수</span>}
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [showExamples, setShowExamples] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const progress = `${(step / 3) * 100}%`;
  const selectedExample = useMemo(
    () => examples.filter((item) => form.businessAreas.length === 0 || form.businessAreas.includes(item.area)),
    [form.businessAreas],
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArea = (area: string) => {
    const exists = form.businessAreas.includes(area);
    if (!exists && form.businessAreas.length >= 3) return;
    update(
      "businessAreas",
      exists ? form.businessAreas.filter((item) => item !== area) : [...form.businessAreas, area],
    );
  };

  const togglePaidAiTool = (tool: string) => {
    const exists = form.paidAiTools.includes(tool);
    if (tool === "유료 계정 없음") {
      update("paidAiTools", exists ? [] : [tool]);
      return;
    }
    const currentTools = form.paidAiTools.filter((item) => item !== "유료 계정 없음");
    update(
      "paidAiTools",
      exists ? currentTools.filter((item) => item !== tool) : [...currentTools, tool],
    );
  };

  const validateStep = () => {
    if (step === 1) return Boolean(form.name && form.company && form.title);
    if (step === 2)
      return Boolean(
        form.aiExperience &&
          form.paidAiTools.length &&
          (!form.paidAiTools.includes("직접입력") || form.paidAiToolOther.trim()) &&
          form.businessAreas.length &&
          (!form.businessAreas.includes("직접입력") || form.businessAreaOther.trim()) &&
          form.primaryOutcome &&
          (form.primaryOutcome !== "직접입력" || form.primaryOutcomeOther.trim()),
      );
    return Boolean(
      form.usecaseTitle &&
        form.currentPain.trim() &&
        form.asIs.trim().length >= 50 &&
        form.toBe.trim().length >= 50 &&
        form.desiredOutput &&
        (form.desiredOutput !== "직접입력" || form.desiredOutputOther.trim()) &&
        form.dataSensitivity &&
        form.successCriteria,
    );
  };

  const next = () => {
    if (!validateStep()) {
      setErrorMessage("필수 항목을 모두 입력해 주세요.");
      return;
    }
    setErrorMessage("");
    setStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const applyExample = (example: (typeof examples)[number]) => {
    update("usecaseTitle", example.title);
    update("asIs", `현재는 ${example.title} 업무에 필요한 자료를 여러 곳에서 직접 수집하고 검토한 뒤 수작업으로 정리하고 있습니다. 이 과정에서 시간이 오래 걸리고 중요한 내용이 누락될 가능성이 있습니다.`);
    update("toBe", `${example.detail} AI가 초안을 만들고 담당자가 결과를 검토·보완하는 방식으로 전환하여, 같은 업무에 반복적으로 활용할 수 있기를 기대합니다.`);
    update("desiredOutput", example.output);
    setShowExamples(false);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateStep() || status === "submitting") {
      setErrorMessage("필수 항목을 모두 입력해 주세요. AS-IS와 TO-BE는 각각 50자 이상 작성해 주세요.");
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paidAiTools: form.paidAiTools.map((tool) => tool === "직접입력" ? form.paidAiToolOther.trim() : tool),
          businessAreas: form.businessAreas.map((area) => area === "직접입력" ? form.businessAreaOther.trim() : area),
          primaryOutcome: form.primaryOutcome === "직접입력" ? form.primaryOutcomeOther.trim() : form.primaryOutcome,
          desiredOutput: form.desiredOutput === "직접입력" ? form.desiredOutputOther.trim() : form.desiredOutput,
        }),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "응답 저장에 실패했습니다.");
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.");
    }
  };

  if (status === "success") {
    return (
      <main className="success-page">
        <div className="success-card">
          <div className="success-mark">✓</div>
          <p className="eyebrow">응답 저장 완료</p>
          <h1>{form.name}님, 준비가 끝났습니다.</h1>
          <p className="success-copy">
            제출하신 Use Case를 바탕으로 강사가 핸즈온 실습을 준비합니다. 세션 전 아래 두 가지만
            미리 떠올려 주세요.
          </p>
          <div className="prep-grid">
            <div><span>01</span><p>AI를 통해 만들고 싶은 Use Case의 구체적인 결과물(웹앱, 프로그램, 챗봇 등)</p></div>
            <div><span>02</span><p>AI 결과가 좋아졌다고 판단할 수 있는 구체적인 기준</p></div>
          </div>
          <button className="secondary-button" onClick={() => { setForm(initialForm); setStep(1); setStatus("idle"); }}>
            다른 응답 작성하기
          </button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <header className="site-header">
        <div className="brand-mark" aria-hidden="true">A</div>
        <div>
          <p className="brand-name">EXECUTIVE AI HANDS-ON</p>
          <p className="brand-sub">사전 준비 설문</p>
        </div>
        <p className="time-badge">약 5분</p>
      </header>

      <div className="page-shell">
        <section className="intro-panel">
          <p className="eyebrow">MAKE YOUR OWN AI AGENT</p>
          <h1>직접 만들고 싶은 <em>AI Use Case</em>를 알려주세요.</h1>
          <p className="intro-copy">
            정답을 찾는 설문이 아닙니다. 지금 떠오르는 업무 장면을 알려주시면,
            구현해 볼 수 있도록 강사가 미리 준비하겠습니다.
          </p>
          <div className="privacy-note"><span>🔒</span><p>작성 내용은 핸즈온 준비 목적으로만 활용됩니다. 실제 기밀 정보 대신 자료의 종류만 적어주세요.</p></div>
        </section>

        <section className="form-panel">
          <div className="progress-head">
            <div><span>STEP {step} OF 3</span><strong>{step === 1 ? "기본 정보" : step === 2 ? "관심 업무" : "Use Case 구체화"}</strong></div>
            <b>{Math.round((step / 3) * 100)}%</b>
          </div>
          <div className="progress-track"><div style={{ width: progress }} /></div>

          <form onSubmit={submit}>
            {step === 1 && (
              <div className="step-content">
                <div className="section-heading"><h2>먼저, 참여자 정보를 알려주세요.</h2><p>강사가 업무 맥락에 맞는 예시와 실습 환경을 준비하는 데 사용합니다.</p></div>
                <div className="two-col">
                  <label><FieldLabel>성명</FieldLabel><input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="홍길동" autoComplete="name" /></label>
                  <label><FieldLabel>소속 / 회사</FieldLabel><input value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="예: ABC 그룹" autoComplete="organization" /></label>
                </div>
                <div className="two-col">
                  <label><FieldLabel>직무</FieldLabel><input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="예: 인사, 마케팅, 전략기획" autoComplete="organization-title" /></label>
                  <label><FieldLabel optional>이메일</FieldLabel><input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="name@company.com" autoComplete="email" /></label>
                </div>
                <div className="mini-tip"><b>TIP</b><p>코딩 경험은 필요하지 않습니다. 평소 해결하고 싶었던 업무 한 가지면 충분합니다.</p></div>
              </div>
            )}

            {step === 2 && (
              <div className="step-content">
                <div className="section-heading"><h2>어떤 업무에 AI를 적용하고 싶으신가요?</h2><p>가장 가까운 항목을 편하게 선택해 주세요.</p></div>
                <fieldset><FieldLabel>생성형 AI 활용 경험</FieldLabel><div className="choice-list">
                  {["거의 사용해 본 적 없음", "요약·검색 등에 가끔 사용", "정기적으로 업무에 활용", "AI Agent(Claude Code, Codex 등) 활용 경험 있음"].map((item) => <label className={`radio-card ${form.aiExperience === item ? "selected" : ""}`} key={item}><input type="radio" name="experience" value={item} checked={form.aiExperience === item} onChange={() => update("aiExperience", item)} /><span>{item}</span></label>)}
                </div></fieldset>
                <fieldset><FieldLabel>유료 생성형 AI 사용 현황 <small>복수 선택 가능</small></FieldLabel><div className="chip-grid paid-ai-grid">
                  {paidAiToolOptions.map((tool) => <label className={`check-chip ${form.paidAiTools.includes(tool) ? "selected" : ""}`} key={tool}><input type="checkbox" checked={form.paidAiTools.includes(tool)} onChange={() => togglePaidAiTool(tool)} /><span>{tool}</span></label>)}
                </div>{form.paidAiTools.includes("직접입력") && <input className="conditional-input" value={form.paidAiToolOther} onChange={(e) => update("paidAiToolOther", e.target.value)} placeholder="사용 중인 유료 생성형 AI를 직접 입력해 주세요" autoFocus />}</fieldset>
                <fieldset><FieldLabel>관심 업무 영역 <small>최대 3개</small></FieldLabel><div className="chip-grid">
                  {businessAreas.map((area) => <label className={`check-chip ${form.businessAreas.includes(area) ? "selected" : ""}`} key={area}><input type="checkbox" checked={form.businessAreas.includes(area)} onChange={() => toggleArea(area)} disabled={!form.businessAreas.includes(area) && form.businessAreas.length >= 3} /><span>{area}</span></label>)}
                </div>{form.businessAreas.includes("직접입력") && <input className="conditional-input" value={form.businessAreaOther} onChange={(e) => update("businessAreaOther", e.target.value)} placeholder="관심 업무 영역을 직접 입력해 주세요" autoFocus />}</fieldset>
                <label><FieldLabel>AI를 통해 가장 얻고 싶은 결과</FieldLabel><select value={form.primaryOutcome} onChange={(e) => update("primaryOutcome", e.target.value)}><option value="">선택해 주세요</option><option>의사결정 속도 향상</option><option>반복 업무 시간 절감</option><option>보고서·콘텐츠 품질 향상</option><option>리스크·누락 사전 발견</option><option>새로운 고객·사업 기회 발굴</option><option>직접입력</option></select>{form.primaryOutcome === "직접입력" && <input className="conditional-input" value={form.primaryOutcomeOther} onChange={(e) => update("primaryOutcomeOther", e.target.value)} placeholder="원하는 결과를 직접 입력해 주세요" autoFocus />}</label>
              </div>
            )}

            {step === 3 && (
              <div className="step-content">
                <div className="section-heading usecase-heading"><div><h2>만들고 싶은 Use Case를 구체화해 주세요.</h2><p>완벽하게 쓰지 않아도 괜찮습니다. 예시를 골라 수정해도 됩니다.</p></div><button type="button" className="example-button" onClick={() => setShowExamples(true)}>✦ 작성 예시 보기</button></div>
                <label><FieldLabel>Use Case 제목</FieldLabel><input value={form.usecaseTitle} onChange={(e) => update("usecaseTitle", e.target.value)} placeholder="예: 주간 경영회의 의사결정 브리프 자동 작성" /></label>
                <label><FieldLabel>현재 업무 방식에서 가장 불편한 점</FieldLabel><textarea value={form.currentPain} onChange={(e) => update("currentPain", e.target.value)} placeholder="예: 자료가 여러 파일에 흩어져 있고, 매주 취합과 요약에 3시간 이상 걸립니다." /></label>
                <fieldset>
                  <FieldLabel>어떤 업무를 어떻게 바꾸고 싶으신가요?</FieldLabel>
                  <div className="change-grid">
                    <label className="change-card">
                      <div className="change-card-head"><strong>AS-IS</strong><span>현재 업무 방식</span></div>
                      <textarea className="large-textarea" value={form.asIs} onChange={(e) => update("asIs", e.target.value)} placeholder="현재 누가, 어떤 자료와 도구를 사용해, 어떤 순서로 업무를 처리하고 있는지 구체적으로 적어주세요." />
                      <span className={`minimum-hint ${form.asIs.trim().length >= 50 ? "met" : ""}`}>{form.asIs.trim().length}/50자 · 최소 50자 이상</span>
                    </label>
                    <label className="change-card to-be-card">
                      <div className="change-card-head"><strong>TO-BE</strong><span>AI 적용 후 모습</span></div>
                      <textarea className="large-textarea" value={form.toBe} onChange={(e) => update("toBe", e.target.value)} placeholder="AI가 어느 부분을 어떻게 도와주고, 최종적으로 업무가 어떤 모습으로 바뀌기를 원하는지 적어주세요." />
                      <span className={`minimum-hint ${form.toBe.trim().length >= 50 ? "met" : ""}`}>{form.toBe.trim().length}/50자 · 최소 50자 이상</span>
                    </label>
                  </div>
                </fieldset>
                <div className="two-col">
                  <label><FieldLabel>원하는 산출물</FieldLabel><select value={form.desiredOutput} onChange={(e) => update("desiredOutput", e.target.value)}><option value="">선택해 주세요</option><option>경영진 보고서·브리프</option><option>분석 리포트·대시보드</option><option>이메일·제안서·콘텐츠</option><option>점검표·액션 리스트</option><option>검색·질의응답 도구</option><option>반복 업무 자동화</option><option>직접입력</option></select>{form.desiredOutput === "직접입력" && <input className="conditional-input" value={form.desiredOutputOther} onChange={(e) => update("desiredOutputOther", e.target.value)} placeholder="원하는 산출물을 직접 입력해 주세요" autoFocus />}</label>
                  <label><FieldLabel>다룰 정보의 민감도</FieldLabel><select value={form.dataSensitivity} onChange={(e) => update("dataSensitivity", e.target.value)}><option value="">선택해 주세요</option><option>공개 가능한 정보</option><option>사내 일반 정보</option><option>민감 정보 포함 가능</option><option>잘 모르겠음</option></select></label>
                </div>
                <label><FieldLabel>성공했다고 판단할 기준</FieldLabel><input value={form.successCriteria} onChange={(e) => update("successCriteria", e.target.value)} placeholder="예: 주 3시간 절감, 핵심 리스크 누락 감소, 초안 품질 향상" /></label>
                <label><FieldLabel optional>강사에게 미리 전하고 싶은 내용</FieldLabel><textarea value={form.instructorNote} onChange={(e) => update("instructorNote", e.target.value)} placeholder="실습 시 고려할 제약, 궁금한 점 등을 자유롭게 적어주세요." /></label>
                <label className="honeypot" aria-hidden="true">웹사이트<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} /></label>
              </div>
            )}

            {errorMessage && <p className="form-error" role="alert">{errorMessage}</p>}
            {status === "submitting" && (
              <div className="loading-notice" role="status"><span className="spinner" /><div><strong>응답을 DB에 안전하게 저장하고 있습니다.</strong><p>완료 화면이 나타날 때까지 이 창을 닫거나 새로고침하지 말아 주세요.</p></div></div>
            )}
            {status === "error" && <div className="retry-note">저장이 완료되지 않았습니다. 입력 내용은 그대로 유지되어 있으니 다시 제출해 주세요.</div>}

            <div className="form-actions">
              {step > 1 && <button type="button" className="back-button" onClick={() => { setStep(step - 1); setErrorMessage(""); }} disabled={status === "submitting"}>이전</button>}
              {step < 3 ? <button type="button" className="primary-button" onClick={next}>다음 단계 <span>→</span></button> : <button type="submit" className="primary-button submit-button" disabled={status === "submitting"}>{status === "submitting" ? "저장 중…" : "설문 제출하기"}<span>{status === "submitting" ? "" : "→"}</span></button>}
            </div>
          </form>
        </section>
      </div>

      {showExamples && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setShowExamples(false)}>
          <section className="example-modal" role="dialog" aria-modal="true" aria-labelledby="example-title" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-head"><div><p className="eyebrow">USE CASE LIBRARY</p><h2 id="example-title">이런 주제로 시작해 보세요.</h2><p>선택하면 입력창에 예시가 채워집니다. 내 업무에 맞게 자유롭게 수정하세요.</p></div><button type="button" aria-label="닫기" onClick={() => setShowExamples(false)}>×</button></div>
            <div className="example-list">{(selectedExample.length ? selectedExample : examples).map((example) => <button type="button" className="example-card" key={example.title} onClick={() => applyExample(example)}><span>{example.area}</span><strong>{example.title}</strong><p>{example.detail}</p><em>이 예시 사용하기 →</em></button>)}</div>
          </section>
        </div>
      )}
    </main>
  );
}
