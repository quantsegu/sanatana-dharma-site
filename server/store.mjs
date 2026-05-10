import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');

async function readJsonFile(fileName) {
  const filePath = path.join(dataDir, fileName);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function writeJsonFile(fileName, data) {
  const filePath = path.join(dataDir, fileName);
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

export async function readVideos() {
  return readJsonFile('videos.json');
}

export async function writeVideos(list) {
  await writeJsonFile('videos.json', list);
}

export async function readBlogs() {
  return readJsonFile('blogs.json');
}

export async function writeBlogs(list) {
  await writeJsonFile('blogs.json', list);
}
