import { chromium } from 'playwright';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = resolve(__dirname, 'part2-engineering.html');
const OUTPUT_DIR = resolve(__dirname, 'output');
const WEBM_PATH = resolve(OUTPUT_DIR, 'part2-raw.webm');
const MP4_PATH = resolve(OUTPUT_DIR, 'part2-engineering.mp4');

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;
const DURATION_MS = 82000; // ~82 seconds total for all scenes

async function main() {
  execSync(`mkdir -p ${OUTPUT_DIR}`);

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    recordVideo: { dir: OUTPUT_DIR, size: { width: WIDTH, height: HEIGHT } },
  });

  const tStart = Date.now();
  const page = await context.newPage();

  // Freeze animations before load
  await page.addInitScript(() => {
    const style = document.createElement('style');
    style.id = '__freeze';
    style.textContent = '*, *::before, *::after { animation-play-state: paused !important; }';
    const attach = () => (document.head || document.documentElement).appendChild(style);
    if (document.head || document.documentElement) attach();
    else document.addEventListener('DOMContentLoaded', attach, { once: true });
  });

  console.log('Loading HTML...');
  await page.goto(`file://${HTML_PATH}`, { waitUntil: 'domcontentloaded' });

  // Wait for fonts
  await page.evaluate(async () => {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    await Promise.all([...links].map(l => new Promise(r => {
      l.addEventListener('load', r, { once: true });
      l.addEventListener('error', r, { once: true });
      setTimeout(r, 5000);
    })));
    await document.fonts.ready;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });

  const leadInMs = Date.now() - tStart;
  console.log(`Lead-in: ${leadInMs}ms`);

  // Unfreeze and start recording
  await page.evaluate(() => {
    const el = document.getElementById('__freeze');
    if (el) el.remove();
  });

  console.log(`Recording ${DURATION_MS / 1000}s...`);
  await page.waitForTimeout(DURATION_MS);

  await context.close();
  await browser.close();

  // Find the webm file
  const fs = await import('fs');
  const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.webm'));
  const webmFile = resolve(OUTPUT_DIR, files[0]);

  console.log(`Raw video: ${webmFile}`);

  // Trim lead-in and encode to MP4
  const ss = Math.max(0, (leadInMs - 120) / 1000);
  const cmd = `ffmpeg -y -ss ${ss} -i "${webmFile}" -t ${DURATION_MS / 1000} -r ${FPS} -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 -movflags +faststart "${MP4_PATH}"`;

  console.log('Encoding MP4...');
  execSync(cmd, { stdio: 'inherit' });

  // Verify
  const duration = execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${MP4_PATH}"`).toString().trim();
  console.log(`\n✅ Output: ${MP4_PATH}`);
  console.log(`   Duration: ${parseFloat(duration).toFixed(1)}s`);

  // Cleanup webm
  fs.unlinkSync(webmFile);
  console.log('   Cleaned up raw webm');
}

main().catch(err => { console.error(err); process.exit(1); });
