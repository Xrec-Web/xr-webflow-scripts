import { put } from '@vercel/blob';

export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const filename    = decodeURIComponent(req.headers['x-filename'] || 'cv');
  const contentType = req.headers['content-type'] || 'application/octet-stream';

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const buffer = Buffer.concat(chunks);

  const blob = await put(`shadowgate/cvs/${Date.now()}-${filename}`, buffer, {
    access:      'public',
    contentType,
  });

  res.status(200).json({ url: blob.url });
}
