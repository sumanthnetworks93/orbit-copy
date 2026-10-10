import { mkdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const sourceDir = join(rootDir, 'assets', 'source');
const assetsDir = join(rootDir, 'assets');
const publicDir = join(rootDir, 'public');

async function renderSvg(name, size, outputPath) {
  const svg = await readFile(join(sourceDir, name), 'utf8');
  await sharp(Buffer.from(svg)).resize(size, size).png({ compressionLevel: 9 }).toFile(outputPath);
}

async function main() {
  await mkdir(publicDir, { recursive: true });

  await renderSvg('orbit-icon.svg', 1024, join(assetsDir, 'icon.png'));
  await renderSvg('orbit-icon.svg', 1024, join(assetsDir, 'logo.png'));
  await renderSvg('orbit-mark.svg', 512, join(assetsDir, 'splash-icon.png'));
  await renderSvg('orbit-mark.svg', 1024, join(assetsDir, 'android-icon-foreground.png'));
  await renderSvg('orbit-background.svg', 1024, join(assetsDir, 'android-icon-background.png'));
  await renderSvg('orbit-monochrome.svg', 1024, join(assetsDir, 'android-icon-monochrome.png'));
  await renderSvg('orbit-icon.svg', 48, join(assetsDir, 'favicon.png'));
  await renderSvg('orbit-icon.svg', 32, join(publicDir, 'favicon-32.png'));
  await renderSvg('orbit-icon.svg', 180, join(publicDir, 'apple-touch-icon.png'));
  await renderSvg('orbit-icon.svg', 192, join(publicDir, 'icon-192.png'));
  await renderSvg('orbit-icon.svg', 512, join(publicDir, 'icon-512.png'));

  const storeDir = join(rootDir, 'store');
  await mkdir(storeDir, { recursive: true });
  const mark = await readFile(join(sourceDir, 'orbit-mark.svg'));
  const icon = await sharp(mark).resize(280, 280).png().toBuffer();
  await sharp({
    create: {
      width: 1024,
      height: 500,
      channels: 3,
      background: '#F4F2EE',
    },
  })
    .composite([{ input: icon, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(join(storeDir, 'feature-graphic.png'));

  console.log('Generated Orbit brand assets.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
