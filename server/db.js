import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Use a fallback for __dirname when bundled or in ESM
const __dirname = typeof __filename !== 'undefined' 
  ? path.dirname(__filename) 
  : path.dirname(fileURLToPath(import.meta.url));

// In bundled production, we want to look relative to the bundle location or a known persistent path
// For Replit, we can use process.cwd() to ensure we are in the project root if needed, 
// but usually __dirname in cjs points to the output dir.
const DB_PATH = path.resolve(process.cwd(), 'server', 'data', 'products.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ products: [] }, null, 2));
  }
}

// Read all products
export function readDb() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { products: [] };
  }
}

// Write entire db
function writeDb(data) {
  ensureDataDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Save a scraped product (upsert by ASIN + creatorId)
export function saveProduct(creatorId, product) {
  const db = readDb();
  const key = `${creatorId}_${product.asin}`;
  
  const existing = db.products.findIndex(p => p._key === key);
  const record = {
    _key: key,
    _id: existing >= 0 ? db.products[existing]._id : Date.now().toString(),
    creatorId,
    savedAt: new Date().toISOString(),
    ...product,
  };

  if (existing >= 0) {
    db.products[existing] = record; // update
  } else {
    db.products.unshift(record); // add to top
  }

  // Keep last 200 products max
  if (db.products.length > 200) {
    db.products = db.products.slice(0, 200);
  }

  writeDb(db);
  return record;
}

// Get all products for a creator
export function getProductsByCreator(creatorId) {
  const db = readDb();
  return db.products.filter(p => p.creatorId === creatorId);
}

// Get all products across all creators
export function getAllProducts() {
  const db = readDb();
  return db.products;
}

// Delete a product by _id
export function deleteProduct(id) {
  const db = readDb();
  db.products = db.products.filter(p => p._id !== id);
  writeDb(db);
}

// ── GENERATIONS ─────────────────────────────────────────────────────────────

const GEN_PATH = path.resolve(process.cwd(), 'server', 'data', 'generations.json');

function ensureGenDir() {
  const dir = path.dirname(GEN_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(GEN_PATH)) {
    fs.writeFileSync(GEN_PATH, JSON.stringify({ generations: [] }, null, 2));
  }
}

function readGenDb() {
  ensureGenDir();
  try {
    const raw = fs.readFileSync(GEN_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { generations: [] };
  }
}

function writeGenDb(data) {
  ensureGenDir();
  fs.writeFileSync(GEN_PATH, JSON.stringify(data, null, 2));
}

export function saveGeneration(creatorId, productName, productData, generatedContent) {
  const db = readGenDb();
  const id = Date.now().toString();
  const record = {
    _id: id,
    creatorId,
    productName,
    productData,
    generatedContent,
    createdAt: new Date().toISOString(),
  };
  db.generations.unshift(record);
  if (db.generations.length > 100) {
    db.generations = db.generations.slice(0, 100);
  }
  writeGenDb(db);
  return record;
}

export function getGenerationsByCreator(creatorId) {
  const db = readGenDb();
  return db.generations.filter(g => g.creatorId === creatorId);
}

export function getGenerationById(id) {
  const db = readGenDb();
  return db.generations.find(g => g._id === id) || null;
}

export function deleteGeneration(id) {
  const db = readGenDb();
  db.generations = db.generations.filter(g => g._id !== id);
  writeGenDb(db);
}
