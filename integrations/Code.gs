const SPREADSHEET_ID = "1d6oX5LvY_CkSg9aX5A683tcNPLASQYayxk9F6NjrdNc";
const SHEET_NAME = "DB";

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const p = e.parameter || {};
    if (!p.submissionId || !p.name || !p.company || !p.usecaseTitle || !p.usecaseDescription) {
      return json_({ ok: false, message: "필수 값이 없습니다." });
    }

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) return json_({ ok: false, message: "DB 시트를 찾을 수 없습니다." });

    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const duplicate = sheet.getRange(2, 1, lastRow - 1, 1)
        .createTextFinder(p.submissionId)
        .matchEntireCell(true)
        .findNext();
      if (duplicate) return json_({ ok: true, submissionId: p.submissionId, duplicate: true });
    }

    sheet.appendRow([
      p.submissionId,
      new Date(),
      p.name || "",
      p.company || "",
      p.title || "",
      p.email || "",
      p.aiExperience || "",
      p.agentPreference || "",
      p.businessAreas || "",
      p.primaryOutcome || "",
      p.usecaseTitle || "",
      p.usecaseDescription || "",
      p.currentPain || "",
      p.desiredOutput || "",
      p.availableDataTools || "",
      p.dataSensitivity || "",
      p.successCriteria || "",
      p.instructorNote || "",
    ]);
    SpreadsheetApp.flush();
    return json_({ ok: true, submissionId: p.submissionId });
  } catch (error) {
    return json_({ ok: false, message: String(error && error.message ? error.message : error) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
