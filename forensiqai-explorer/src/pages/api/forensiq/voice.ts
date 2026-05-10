import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey!, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.55, similarity_boost: 0.75 }
    })
  });

  const audio = await response.arrayBuffer();
  res.setHeader('Content-Type', 'audio/mpeg');
  res.end(Buffer.from(audio));
}
