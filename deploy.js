import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import path from 'path';

const BUCKET_NAME = 'thaya-ui';
const FILE_PATHS = ['404.html', 'dist/index.html'];
const ASSETS_DIR = 'dist/assets';

const INDEX_PATH = 'dist/index.html';
let indexContent = fs.readFileSync(INDEX_PATH, 'utf8');
const ASSETS_BASE_URL =  `https://storage.googleapis.com/${BUCKET_NAME}/assets/`;

indexContent = indexContent
  .replace(/src="\/assets\/([^"]+)"/g, `src="${ASSETS_BASE_URL}$1"`)
  .replace(/href="\/assets\/([^"]+)"/g, `href="${ASSETS_BASE_URL}$1"`);
fs.writeFileSync(INDEX_PATH, indexContent, 'utf8');

const storage = new Storage();

async function uploadSingleFile(srcPath, destPath) {
  await storage.bucket(BUCKET_NAME).upload(srcPath, {
    destination: destPath,
    overwrite: true,
    resumable: false,
  });
  console.log(`${srcPath} uploaded to ${BUCKET_NAME}/${destPath}`);
}

for (const filePath of FILE_PATHS) {
  const destFileName = filePath.replace('dist/', '');
  await uploadSingleFile(filePath, destFileName);
}

async function uploadDir(dir, base = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.join(base, entry.name);
    if (entry.isDirectory()) {
      await uploadDir(fullPath, relPath);
    } else {
      await uploadSingleFile(fullPath, path.join('assets', relPath));
    }
  }
}

await uploadDir(ASSETS_DIR);