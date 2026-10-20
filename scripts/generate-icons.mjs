import sharp from 'sharp';

for (const size of [192, 512]) {
  await sharp('public/icons/icon.svg').resize(size, size).png().toFile(`public/icons/icon-${size}.png`);
}

const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#2563eb"/><path d="M164 256 L226 318 L348 194" fill="none" stroke="#fff" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
await sharp(Buffer.from(maskable)).png().toFile('public/icons/icon-maskable-512.png');
console.log('Created 192x192, 512x512 and maskable 512x512 icons');
