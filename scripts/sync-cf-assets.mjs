/**
 * Copies the static site files into cf-assets/ for Wrangler static assets deploy.
 * Run before `wrangler deploy`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dst = path.join(root, 'cf-assets');

// Static files / dirs to include in the Worker asset bundle
const include = ['index.html', '404.html', 'css', 'js', 'assets'];

fs.rmSync(dst, { recursive: true, force: true });
fs.mkdirSync(dst, { recursive: true });

for (const item of include) {
  const src = path.join(root, item);
  if (!fs.existsSync(src)) {
    console.warn(`[sync-cf-assets] Skipping missing: ${item}`);
    continue;
  }
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.cpSync(src, path.join(dst, item), { recursive: true });
    console.log(`[sync-cf-assets] Copied dir  ${item}/`);
  } else {
    fs.copyFileSync(src, path.join(dst, item));
    console.log(`[sync-cf-assets] Copied file ${item}`);
  }
}

console.log(`[sync-cf-assets] Done → cf-assets/`);
