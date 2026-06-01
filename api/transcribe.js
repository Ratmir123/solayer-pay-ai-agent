// Vercel Edge Function — OpenAI Whisper STT proxy.
//
// This replaces serve.py's POST /api/transcribe on Vercel (where there is no
// long-running Python server). The browser records mic audio and POSTs the raw
// blob here; we forward it to OpenAI's transcription API with the server-side
// key and return { text }. The key (OPENAI_API_KEY) lives ONLY here as a Vercel
// environment variable and never reaches the browser.
//
// Edge runtime is used because request.arrayBuffer() gives us the raw binary
// body reliably (the Node body-parser can swallow non-JSON streams).

export const config = { runtime: 'edge' };

const OPENAI_URL = 'https://api.openai.com/v1/audio/transcriptions';

// content-type → file extension (OpenAI infers the format from the filename)
const EXT = {
  'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/mp4': 'mp4',
  'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });

export default async function handler(req) {
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405);

  const key = process.env.OPENAI_API_KEY;
  if (!key) return json({ error: 'OPENAI_API_KEY not set on the server' }, 500);
  const model = process.env.OPENAI_STT_MODEL || 'whisper-1';

  const buf = await req.arrayBuffer();
  if (!buf || !buf.byteLength) return json({ error: 'empty audio body' }, 400);

  // mic sends e.g. "audio/webm;codecs=opus" — strip params to the base type
  const ctype = (req.headers.get('content-type') || 'audio/webm').split(';')[0].trim();
  const ext = EXT[ctype] || 'webm';

  const form = new FormData();
  form.append('model', model);
  form.append('file', new Blob([buf], { type: ctype }), `audio.${ext}`);

  try {
    const r = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: form, // fetch sets the multipart boundary automatically
    });
    const text = await r.text();
    if (!r.ok) return json({ error: 'openai', detail: text }, r.status);
    let data = {};
    try { data = JSON.parse(text); } catch (_) {}
    return json({ text: data.text || '' });
  } catch (e) {
    return json({ error: String((e && e.message) || e) }, 502);
  }
}
