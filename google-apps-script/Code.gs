/**
 * Lafayette Sound — contact form notifier.
 *
 * Deploy as a Web App (Deploy > New deployment > Web app):
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Copy the resulting /exec URL into APPS_SCRIPT_URL in assets/js/contact-form.js.
 */

var NOTIFY_RECIPIENTS = 'info@lafayettesound.com,elijah@vitromedialab.com';

function doPost(e) {
  try {
    var data = parseRequest(e);
    sendNotification(data);
    return jsonResponse({ result: 'success' });
  } catch (err) {
    return jsonResponse({ result: 'error', message: err.message });
  }
}

function parseRequest(e) {
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // Not JSON — fall through to form-encoded params.
    }
  }
  return e.parameter || {};
}

function sendNotification(data) {
  var name = data.name || '(not provided)';
  var subject = 'New Website Inquiry from ' + name;

  var lines = [
    'New contact form submission from lafayettesound.com',
    '',
    'Name: ' + name,
  ];
  if (data.company) lines.push('Company: ' + data.company);
  lines.push('Email: ' + (data.email || '(not provided)'));
  if (data.phone) lines.push('Phone: ' + data.phone);
  if (data.eventDate) lines.push('Event Date: ' + data.eventDate);
  if (data.services) lines.push('Services: ' + data.services);
  lines.push('', 'Message:', data.message || '(none)');

  MailApp.sendEmail({
    to: NOTIFY_RECIPIENTS,
    replyTo: data.email || NOTIFY_RECIPIENTS,
    subject: subject,
    body: lines.join('\n')
  });
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
