// Aslan'ın Günlüğü — bildirim Worker'ı (Web Push). Tek dosya, bağımlılık yok.
// AI Worker'ından (aslaningunlugu) ayrı bir Worker'dır; onunla karışmaz.
//
// Nasıl çalışır: uygulama (iPhone'daki ana ekran uygulaması) bildirim izni alıp aboneliğini
// buraya gönderir; ayrıca "yaklaşan hatırlatmalar" listesini gönderir ({id, t, title, body}).
// Burada dakikada bir çalışan cron, zamanı gelen hatırlatmayı Web Push ile gönderir.
// Uygulama kapalıyken de gelir. İki telefon TEK ortak plan paylaşır: hangi telefonda kayıt
// girilirse plan o telefondan yenilenir, bildirim abone olan her telefona gider.
//
// Ayarlar (Cloudflare → Worker → Settings):
//   Variables:  FIREBASE_PROJECT_ID, ALLOWED_EMAILS (virgülle), ALLOWED_ORIGINS (virgülle)
//   KV binding: KV
//   Cron:       * * * * *
//
// KV düzeni: vapid = {pub, priv}; push:subs = [{endpoint, keys}]; push:items = [{id,t,title,body}];
// push:sent = [id]. (Ayrı anahtarlar: cron ile plan güncellemesi birbirinin üstüne yazmasın.)

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=')), (c) => c.charCodeAt(0));
const concat = (...arrs) => { const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0)); let o = 0; for (const a of arrs) { out.set(a, o); o += a.length; } return out; };

/* ---------- Firebase ID token doğrulama (RS256, Google'ın açık anahtarlarıyla) ---------- */
const JWK_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const jsonPart = (s) => JSON.parse(new TextDecoder().decode(unb64u(s)));
let jwkCache = { keys: null, at: 0 };
async function jwks() {
  if (jwkCache.keys && Date.now() - jwkCache.at < 3600_000) return jwkCache.keys;
  const r = await fetch(JWK_URL, { cf: { cacheTtl: 3600 } });
  if (!r.ok) throw new Error('jwk fetch failed');
  jwkCache = { keys: (await r.json()).keys, at: Date.now() };
  return jwkCache.keys;
}
// Geçerliyse e-posta adresini (küçük harf) döndürür, değilse hata fırlatır.
async function verifyIdToken(token, projectId) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('malformed');
  const header = jsonPart(parts[0]);
  const claims = jsonPart(parts[1]);
  if (header.alg !== 'RS256') throw new Error('alg');
  const jwk = (await jwks()).find((k) => k.kid === header.kid);
  if (!jwk) throw new Error('kid');
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, unb64u(parts[2]), enc.encode(`${parts[0]}.${parts[1]}`));
  if (!ok) throw new Error('signature');
  const sec = Date.now() / 1000;
  if (claims.aud !== projectId || claims.iss !== `https://securetoken.google.com/${projectId}`) throw new Error('claims');
  if (!claims.sub || claims.exp < sec || claims.iat > sec + 300) throw new Error('expired');
  if (!claims.email) throw new Error('no email');
  return String(claims.email).toLowerCase();
}
async function authed(env, req) {
  const h = req.headers.get('Authorization') || '';
  if (!h.startsWith('Bearer ')) return false;
  try {
    const email = await verifyIdToken(h.slice(7), env.FIREBASE_PROJECT_ID);
    const allowed = (env.ALLOWED_EMAILS || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
    return allowed.includes(email);
  } catch { return false; }
}

/* ---------- Web Push: VAPID (RFC 8292) + aes128gcm şifreleme (RFC 8188 / 8291) ---------- */
async function generateVapid() {
  const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  return { pub: b64u(await crypto.subtle.exportKey('raw', kp.publicKey)), priv: await crypto.subtle.exportKey('jwk', kp.privateKey) };
}
async function vapidHeader(vapid, endpoint, subject) {
  const aud = new URL(endpoint).origin;
  const head = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64u(enc.encode(JSON.stringify({ aud, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })));
  const key = await crypto.subtle.importKey('jwk', vapid.priv, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(`${head}.${claims}`));
  return `vapid t=${head}.${claims}.${b64u(sig)}, k=${vapid.pub}`;
}
const hkdf = async (salt, ikm, info, len) => {
  const k = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, k, len * 8));
};
async function encryptPayload(sub, text) {
  const uaPublic = unb64u(sub.keys.p256dh);
  const authSecret = unb64u(sub.keys.auth);
  const eph = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', eph.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, eph.privateKey, 256));
  const ikm = await hkdf(authSecret, ecdh, concat(enc.encode('WebPush: info\0'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\0'), 12);
  const plain = concat(enc.encode(text), new Uint8Array([2]));
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, plain));
  const header = new Uint8Array(21);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096);
  header[20] = asPublic.length;
  return concat(header, asPublic, cipher);
}
// 201 = kabul edildi, 404/410 = abonelik artık yok
async function sendPush(vapid, sub, payload, subject) {
  const body = await encryptPayload(sub, JSON.stringify(payload));
  const r = await fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      Authorization: await vapidHeader(vapid, sub.endpoint, subject),
      'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '3600', Urgency: 'high',
    },
    body,
  });
  return r.status;
}

/* ---------- Abonelikler, plan, gönderim ---------- */
const SUBJECT = 'https://semihcanyanar-pixel.github.io/Aslan-n-G-nl-/';
const HOSTS = [/\.push\.apple\.com$/, /^fcm\.googleapis\.com$/, /\.push\.services\.mozilla\.com$/, /\.notify\.windows\.com$/];
const MAX_ITEMS = 50;
const LATE_MS = 20 * 60 * 1000; // bundan geç kalmış hatırlatma bayat sayılır, gönderilmez

async function getVapid(env) {
  const cur = await env.KV.get('vapid', 'json');
  if (cur) return cur;
  const v = await generateVapid();
  await env.KV.put('vapid', JSON.stringify(v));
  return v;
}
const getSubs = async (env) => (await env.KV.get('push:subs', 'json')) || [];
const putSubs = (env, subs) => env.KV.put('push:subs', JSON.stringify(subs));

function validSub(s) {
  try {
    const u = new URL(s?.endpoint);
    return u.protocol === 'https:' && HOSTS.some((h) => h.test(u.hostname)) && typeof s.keys?.p256dh === 'string' && typeof s.keys?.auth === 'string'
      && s.keys.p256dh.length < 200 && s.keys.auth.length < 100;
  } catch { return false; }
}
async function subscribe(env, sub) {
  if (!validSub(sub)) return false;
  const subs = await getSubs(env);
  await putSubs(env, [...subs.filter((x) => x.endpoint !== sub.endpoint), { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }].slice(-6));
  return true;
}
async function unsubscribe(env, endpoint) {
  await putSubs(env, (await getSubs(env)).filter((x) => x.endpoint !== endpoint));
}
const cleanItems = (list) => (Array.isArray(list) ? list : []).slice(0, MAX_ITEMS).flatMap((i) => (
  i && typeof i.id === 'string' && i.id.length < 80 && Number.isFinite(i.t)
    ? [{ id: i.id, t: Math.round(i.t), title: String(i.title || 'Aslan').slice(0, 80), body: String(i.body || '').slice(0, 200) }] : []));
// Planı değiştirir; aynıysa KV'ye yazmaz (ücretsiz planda günlük yazma sınırı var).
async function setSchedule(env, items) {
  const cur = (await env.KV.get('push:items', 'json')) || [];
  const next = cleanItems(items);
  if (JSON.stringify(cur) === JSON.stringify(next)) return { changed: false, count: next.length };
  await env.KV.put('push:items', JSON.stringify(next));
  return { changed: true, count: next.length };
}
// Verilen abonelik listesine gönderir; ölenleri döndürür.
async function deliver(vapid, subs, payload) {
  let ok = 0;
  const gone = [];
  for (const s of subs) {
    let status = 0;
    try { status = await sendPush(vapid, s, payload, SUBJECT); } catch (e) { console.log('push send failed', String(e)); }
    if (status >= 200 && status < 300) ok++;
    if (status === 404 || status === 410) gone.push(s.endpoint);
    else if (status && (status < 200 || status >= 300)) console.log('push status', status);
  }
  return { ok, gone };
}
async function dropGone(env, gone) {
  if (!gone.length) return;
  await putSubs(env, (await getSubs(env)).filter((x) => !gone.includes(x.endpoint)));
}
async function sendTest(env, endpoint) {
  let subs = await getSubs(env);
  if (endpoint) subs = subs.filter((s) => s.endpoint === endpoint);
  if (!subs.length) return { sent: 0, devices: 0 };
  const time = new Date().toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul' });
  const r = await deliver(await getVapid(env), subs, { title: "Aslan'ın Günlüğü", body: `Bildirimler çalışıyor. Gönderildi: ${time}`, tag: `test-${Date.now()}` });
  await dropGone(env, r.gone);
  return { sent: r.ok, devices: subs.length };
}
// Cron (dakikada bir): zamanı gelen hatırlatmaları bir kez gönderir.
async function runDue(env, now = Date.now()) {
  const items = (await env.KV.get('push:items', 'json')) || [];
  if (!items.length) return 0;
  const sent = (await env.KV.get('push:sent', 'json')) || [];
  const due = items.filter((i) => i.t <= now && i.t > now - LATE_MS && !sent.includes(i.id));
  if (!due.length) return 0;
  const subs = await getSubs(env);
  if (!subs.length) return 0;
  const vapid = await getVapid(env);
  let total = 0;
  const gone = [];
  // Önce "gönderildi" yazılır: cron üst üste binse bile aynı bildirim iki kez gitmesin
  await env.KV.put('push:sent', JSON.stringify([...sent, ...due.map((i) => i.id)].slice(-100)));
  for (const i of due) {
    const r = await deliver(vapid, subs, { title: i.title, body: i.body, tag: i.id });
    total += r.ok;
    gone.push(...r.gone);
  }
  await dropGone(env, gone);
  return total;
}

/* ---------- HTTP ---------- */
const cors = (env, req) => {
  const origin = req.headers.get('Origin') || '';
  const ok = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).includes(origin);
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'null',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin',
  };
};
const reply = (env, req, body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(env, req) },
});

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runDue(env).then((n) => { if (n) console.log('push delivered', n); }).catch((e) => console.log('push cron failed', String(e))));
  },
  async fetch(req, env) {
    const url = new URL(req.url);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env, req) });
    if (req.method === 'GET' && url.pathname === '/push/key') return reply(env, req, { key: (await getVapid(env)).pub });
    const paths = ['/push/subscribe', '/push/unsubscribe', '/push/schedule', '/push/test'];
    if (req.method === 'POST' && paths.includes(url.pathname)) {
      if (!(await authed(env, req))) return reply(env, req, { error: 'unauthorized' }, 401);
      const body = await req.json().catch(() => ({}));
      if (url.pathname === '/push/subscribe') return (await subscribe(env, body.subscription)) ? reply(env, req, { ok: true }) : reply(env, req, { error: 'bad subscription' }, 400);
      if (url.pathname === '/push/unsubscribe') { await unsubscribe(env, String(body.endpoint || '')); return reply(env, req, { ok: true }); }
      if (url.pathname === '/push/schedule') return reply(env, req, await setSchedule(env, body.items));
      return reply(env, req, await sendTest(env, typeof body.endpoint === 'string' ? body.endpoint : ''));
    }
    return reply(env, req, { error: 'not found' }, 404);
  },
};
