/**
 * Employer Savings Hub — Lead Capture Webhook
 *
 * Deploy as: Google Apps Script Web App
 * Sheet columns: Timestamp | First Name | Last Name | Email | Phone | Employee Count | Industry | Event ID | Page URL
 *
 * Setup:
 * 1. Create a new Google Sheet (name it "Employer Savings Hub Leads")
 * 2. In the Sheet, go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click Deploy > New deployment
 * 5. Type: Web app
 * 6. Execute as: Me
 * 7. Who has access: Anyone
 * 8. Click Deploy and copy the Web App URL
 * 9. Paste that URL into script.js where it says webhookUrl = ''
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

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
      // Bold the header row
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

// Required for CORS preflight from browsers
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Employer Savings Hub webhook is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
