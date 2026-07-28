import fetch from 'node-fetch';

export async function generateImageUrl(prompt, seed) {
  const encoded = encodeURIComponent(prompt.trim());
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=512&seed=${seed}&model=flux&nologo=true`;

  // Verify the image is reachable (HEAD request)
  const check = await fetch(imageUrl, { method: 'HEAD' });
  if (!check.ok) {
    throw new Error('Image generation service unavailable');
  }

  return imageUrl;
}
