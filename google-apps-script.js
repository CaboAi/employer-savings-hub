/**
 * Employer Savings Hub — Lead Capture Webhook + Email Notification
 *
 * Deploy as: Google Apps Script Web App
 * Sheet columns: Timestamp | First Name | Last Name | Email | Phone | Employee Count | Industry | Event ID | Page URL
 *
 * IMPORTANT: After pasting this code, you must re-deploy:
 *   Deploy > Manage deployments > Edit (pencil icon) > Version: New version > Deploy
 *   (A new deployment URL is NOT needed — just update the existing one)
 */

// ---- CONFIG ----
var NOTIFY_EMAIL = 'caboconnectai@gmail.com';
// ----------------

function doPost(e) {
  try {
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

    var timestamp = data.submittedAt || new Date().toISOString();
    var firstName = data.firstName || '';
    var lastName = data.lastName || '';
    var email = data.email || '';
    var phone = data.phone || '';
    var employeeCount = data.employeeCount || '';
    var industry = data.industry || '';
    var eventId = data.eventId || '';
    var pageUrl = data.pageUrl || '';

    sheet.appendRow([
      timestamp, firstName, lastName, email,
      phone, employeeCount, industry, eventId, pageUrl
    ]);

    // Send email notification
    sendLeadNotification({
      timestamp: timestamp,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      employeeCount: employeeCount,
      industry: industry
    });

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendLeadNotification(lead) {
  var subject = 'New Lead: ' + lead.firstName + ' ' + lead.lastName + ' — Employer Savings Hub';

  var body = 'New lead from employersavingshub.com\n'
    + '─────────────────────────────────\n\n'
    + 'Name:       ' + lead.firstName + ' ' + lead.lastName + '\n'
    + 'Email:      ' + lead.email + '\n'
    + 'Phone:      ' + lead.phone + '\n'
    + 'Employees:  ' + lead.employeeCount + '\n'
    + 'Industry:   ' + lead.industry + '\n'
    + 'Submitted:  ' + lead.timestamp + '\n\n'
    + '─────────────────────────────────\n'
    + 'View all leads: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl();

  var html = '<div style="font-family:sans-serif;max-width:560px;margin:0 auto">'
    + '<h2 style="color:#061b31;font-weight:400;margin-bottom:4px">New Lead</h2>'
    + '<p style="color:#64748d;font-size:13px;margin-top:0">employersavingshub.com</p>'
    + '<table style="width:100%;border-collapse:collapse;margin:20px 0">'
    + row('Name', lead.firstName + ' ' + lead.lastName)
    + row('Email', '<a href="mailto:' + lead.email + '">' + lead.email + '</a>')
    + row('Phone', '<a href="tel:' + lead.phone + '">' + lead.phone + '</a>')
    + row('Employees', lead.employeeCount)
    + row('Industry', lead.industry)
    + row('Submitted', lead.timestamp)
    + '</table>'
    + '<a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '" '
    + 'style="display:inline-block;background:#0d6e3f;color:#fff;padding:10px 20px;'
    + 'border-radius:4px;text-decoration:none;font-size:14px">View All Leads</a>'
    + '</div>';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    body: body,
    htmlBody: html
  });
}

function row(label, value) {
  return '<tr>'
    + '<td style="padding:8px 12px 8px 0;color:#64748d;font-size:13px;border-bottom:1px solid #e5edf5;white-space:nowrap">' + label + '</td>'
    + '<td style="padding:8px 0;color:#061b31;font-size:14px;border-bottom:1px solid #e5edf5">' + value + '</td>'
    + '</tr>';
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Employer Savings Hub webhook is live.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
