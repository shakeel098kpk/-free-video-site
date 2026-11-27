export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const topic = String(body.topic || '').slice(0, 2000);
  const mode = body.mode === 'story' ? 'story' : 'facts';
  const lang = body.lang === 'en' ? 'en' : 'ur';
  if (!topic.trim()) return res.status(400).json({ error: 'topic khali hai' });

  const repo = process.env.GH_REPO || 'shakeel098kpk/Free-video';
  const wf = process.env.GH_WORKFLOW || 'video.yml';

  const r = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${wf}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'free-video-site'
    },
    body: JSON.stringify({ ref: 'main', inputs: { topic, mode, lang } })
  });

  if (r.status === 204) return res.status(200).json({ ok: true });
  const t = await r.text();
  return res.status(500).json({ ok: false, status: r.status, detail: t });
}
