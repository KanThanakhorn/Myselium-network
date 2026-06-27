const https = require('https');
const http = require('http');

/**
 * Helper to send a POST request with JSON payload.
 * Supports both http and https protocols.
 */
function postJSON(urlStr, headers, data) {
  return new Promise((resolve, reject) => {
    try {
      const url = new URL(urlStr);
      const client = url.protocol === 'https:' ? https : http;
      const bodyStr = JSON.stringify(data);
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(bodyStr),
          ...headers
        }
      };
      
      const req = client.request(options, (res) => {
        let responseBody = '';
        res.on('data', chunk => responseBody += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, body: responseBody });
          } else {
            reject(new Error(`Request failed with status ${res.statusCode}: ${responseBody}`));
          }
        });
      });
      
      req.on('error', (err) => {
        reject(err);
      });
      
      req.write(bodyStr);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Sends a notification when a new alert is generated.
 * Integrates with Hermes Agent Webhook and/or LINE Messaging API.
 */
exports.sendAlertNotification = async (alert) => {
  const hermesWebhookUrl = process.env.HERMES_WEBHOOK_URL;
  const lineChannelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const lineUserId = process.env.LINE_USER_ID;

  const thaiTime = new Date(alert.timestamp).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const sensorLabel = alert.sensorType === 'smoke' ? 'ควันไฟ (Smoke)' : 'อุณหภูมิ (Temperature)';
  const unit = alert.sensorType === 'smoke' ? 'ppm' : '°C';
  
  const alertMessage = 
    `⚠️ [เตือนภัยไฟป่า - Mycelium Network]\n` +
    `🔴 ระดับความรุนแรง: ${alert.severity.toUpperCase()}\n` +
    `📍 โหนดต้นทาง: ${alert.sourceNodeId}\n` +
    `🔥 เซ็นเซอร์ตรวจจับ: ${sensorLabel}\n` +
    `📈 ค่าที่วัดได้: ${alert.value} ${unit} (เกณฑ์แจ้งเตือน: ${alert.threshold} ${unit})\n` +
    `🌐 พิกัด: ละติจูด ${alert.location.lat}, ลองจิจูด ${alert.location.lng}\n` +
    `🕒 เวลาเกิดเหตุ: ${thaiTime} น.`;

  // 1. Send webhook notification to Hermes Agent if configured
  if (hermesWebhookUrl) {
    try {
      console.log(`📡 Sending alert webhook to Hermes Agent: ${hermesWebhookUrl}`);
      await postJSON(hermesWebhookUrl, {}, {
        event: 'wildfire_alert',
        alertId: alert.alertId,
        severity: alert.severity,
        sourceNodeId: alert.sourceNodeId,
        sensorType: alert.sensorType,
        value: alert.value,
        threshold: alert.threshold,
        location: alert.location,
        timestamp: alert.timestamp,
        formattedMessage: alertMessage
      });
      console.log('✅ Webhook sent successfully to Hermes Agent');
    } catch (err) {
      console.error(`❌ Failed to send webhook to Hermes Agent: ${err.message}`);
    }
  }

  // 2. Direct LINE push notification if credentials are provided in .env
  if (lineChannelAccessToken && lineUserId) {
    try {
      console.log('📡 Sending push notification directly to LINE Chatbot...');
      const lineUrl = 'https://api.line.me/v2/bot/message/push';
      const lineHeaders = {
        'Authorization': `Bearer ${lineChannelAccessToken}`
      };
      const linePayload = {
        to: lineUserId,
        messages: [
          {
            type: 'text',
            text: alertMessage
          }
        ]
      };
      await postJSON(lineUrl, lineHeaders, linePayload);
      console.log('✅ LINE push notification sent successfully');
    } catch (err) {
      console.error(`❌ Failed to send LINE push notification: ${err.message}`);
    }
  }
};
