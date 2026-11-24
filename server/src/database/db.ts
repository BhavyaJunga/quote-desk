
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDirectory = path.join(process.cwd(), "data");

if (!fs.existsSync(dataDirectory)) {
  fs.mkdirSync(dataDirectory, { recursive: true });
}

const db = new Database(path.join(dataDirectory, "quote-desk.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS rfqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    partNumber TEXT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    neededBy TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rfqId INTEGER NOT NULL,
    supplierName TEXT NOT NULL,
    unitPrice REAL NOT NULL,
    leadTimeDays INTEGER NOT NULL,
    validUntil TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (rfqId) REFERENCES rfqs(id) ON DELETE CASCADE
  );
`);

export default db;
