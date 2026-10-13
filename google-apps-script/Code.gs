/**
 * Lafayette Sound — contact form notifier.
 *
 * Deploy as a Web App (Deploy > New deployment > Web app):
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Copy the resulting /exec URL into APPS_SCRIPT_URL in assets/js/contact-form.js.
 *
 * Cloudflare Turnstile: add a Script Property (Project Settings > Script Properties)
 * named TURNSTILE_SECRET with the widget's secret key. Never commit the secret here.
 * Submissions without a valid token are rejected and no email is sent.
 *
 * After editing, redeploy via Deploy > Manage deployments > Edit > New version
 * so the /exec URL stays the same.
 */

var NOTIFY_RECIPIENTS = 'info@lafayettesound.com,elijah@vitromedialab.com';
var TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function doPost(e) {
  try {
    var data = parseRequest(e);
    if (!verifyTurnstile(data['cf-turnstile-response'])) {
      return jsonResponse({ result: 'error', message: 'verification-failed' });
    }
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

function verifyTurnstile(token) {
  var secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  // Fail closed: no secret or no token means no email.
  if (!secret || !token) return false;

  var res = UrlFetchApp.fetch(TURNSTILE_VERIFY_URL, {
    method: 'post',
    payload: { secret: secret, response: token },
    muteHttpExceptions: true
  });
  try {
    return JSON.parse(res.getContentText()).success === true;
  } catch (err) {
    return false;
  }
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
