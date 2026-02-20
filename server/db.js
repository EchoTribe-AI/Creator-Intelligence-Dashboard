import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'data', 'products.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.join(__dirname, 'data');
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
