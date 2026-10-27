/**
 * 聯絡表單代理：access key 只存在伺服器環境變數，不進前端。
 * 環境變數：WEB3FORMS_ACCESS_KEY
 */
const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const MAX_BODY = 32_000;

const ALLOWED_ORIGINS = new Set([
  'https://nexterasia.com',
  'https://www.nexterasia.com',
  'https://lambent-phoenix-df5120.netlify.app',
  'http://localhost:8888',
  'http://localhost:3000',
]);

function corsHeaders(origin) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://nexterasia.com';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
}

function json(statusCode, payload, origin) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    body: JSON.stringify(payload),
  };
}

function str(v, max = 2000) {
  if (typeof v !== 'string') return '';
  return v.trim().slice(0, max);
}

export async function handler(event) {
  const origin = event.headers?.origin || event.headers?.Origin || '';

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: corsHeaders(origin), body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return json(405, { success: false, message: 'Method not allowed' }, origin);
  }

  const raw = event.body || '';
  if (raw.length > MAX_BODY) {
    return json(413, { success: false, message: 'Payload too large' }, origin);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return json(400, { success: false, message: 'Invalid JSON' }, origin);
  }

  // 蜜罐：機器人填了隱藏欄就假裝成功，不轉寄
  if (str(data.hp_company) || data.botcheck === true) {
    return json(200, { success: true }, origin);
  }

  const name = str(data.name, 80);
  const email = str(data.email, 160);
  const message = str(data.message, 1000);
  if (!name || !email || !message || message.length < 20) {
    return json(400, { success: false, message: 'Missing or invalid fields' }, origin);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(400, { success: false, message: 'Invalid email' }, origin);
  }

  const accessKey = (process.env.WEB3FORMS_ACCESS_KEY || '').trim();
  if (!accessKey) {
    return json(503, { success: false, message: 'Form service unavailable' }, origin);
  }

  const company = str(data.company, 120);
  const payload = {
    access_key: accessKey,
    subject: str(data.subject, 200) || `NextEra 網站查詢｜${company || name}`,
    from_name: 'NextEra Website',
    name,
    company,
    email,
    phone: str(data.phone, 24),
    website: str(data.website, 300),
    services: str(data.services, 300),
    message,
    startTime: str(data.startTime, 80),
    sourceCase: str(data.sourceCase, 80),
    platforms: str(data.platforms, 200),
    managedIssue: str(data.managedIssue, 200),
    trainingSize: str(data.trainingSize, 80),
    aiLevel: str(data.aiLevel, 80),
    trainingGoal: str(data.trainingGoal, 600),
    projectTypes: str(data.projectTypes, 300),
    currentSystems: str(data.currentSystems, 200),
    integration: str(data.integration, 200),
    botcheck: false,
  };

  try {
    const res = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok || result.success === false) {
      return json(502, { success: false, message: result.message || 'Upstream error' }, origin);
    }
    return json(200, { success: true }, origin);
  } catch {
    return json(502, { success: false, message: 'Upstream unreachable' }, origin);
  }
}
