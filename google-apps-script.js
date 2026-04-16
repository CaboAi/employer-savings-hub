/**
 * Employer Savings Hub — Lead Capture Webhook
 *
 * Deploy as: Google Apps Script Web App
 * Sheet columns: Timestamp | First Name | Last Name | Email | Phone | Employee Count | Industry | Event ID | Page URL
 *
 * IMPORTANT: After pasting this code, you must re-deploy:
 *   Deploy > Manage deployments > Edit (pencil icon) > Version: New version > Deploy
 *   (A new deployment URL is NOT needed — just update the existing one)
 */

function doPost(e) {
  try {
    // Form submissions arrive as e.parameter (key-value pairs),
    // not as JSON in e.postData.contents
    var data = e.parameter;

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Employee Count',
        'Industry',
        'Event ID',
        'Page URL'
      ]);
      sheet.getRange(1, 1, 1, 9).setFontWeight('bold');
    }

    sheet.appendRow([
      data.submittedAt || new Date().toISOString(),
      data.firstName || '',
      data.lastName || '',
      data.email || '',
      data.phone || '',
      data.employeeCount || '',
      data.industry || '',
      data.eventId || '',
      data.pageUrl || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Employer Savings Hub webhook is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
