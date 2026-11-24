
import { Router } from "express";
import db from "../database/db.js";
import { getBestQuote } from "../services/quoteService.js";

const router = Router();

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getStatus(neededBy: string, quotes: any[]): string {
  const today = getToday();

  // Expired takes priority if the RFQ deadline has passed.
  if (neededBy < today) return "Expired";

  if (quotes.length === 0) return "Open";

  const hasValidQuote = quotes.some(
    (quote) => quote.validUntil >= today
  );

  return hasValidQuote ? "Quoted" : "Expired";
}

// GET all RFQs
router.get("/", (_req, res) => {
  const rfqs = db.prepare(
    "SELECT * FROM rfqs ORDER BY id DESC"
  ).all() as any[];

  const result = rfqs.map((rfq) => {
    const quotes = db.prepare(
      "SELECT * FROM quotes WHERE rfqId = ?"
    ).all(rfq.id) as any[];

    return {
      ...rfq,
      status: getStatus(rfq.neededBy, quotes),
      quotes,
      bestQuote: getBestQuote(rfq, quotes, getToday())
    };
  });

  res.json(result);
});

// POST create RFQ
router.post("/", (req, res) => {
  const { partNumber, description, quantity, neededBy } = req.body;

  if (
    !partNumber?.trim() ||
    !description?.trim() ||
    !Number.isInteger(quantity) ||
    quantity <= 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(neededBy)
  ) {
    return res.status(400).json({
      message: "Invalid RFQ details"
    });
  }

  const result = db.prepare(`
    INSERT INTO rfqs
    (partNumber, description, quantity, neededBy, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    partNumber.trim(),
    description.trim(),
    quantity,
    neededBy,
    new Date().toISOString()
  );

  res.status(201).json({
    message: "RFQ created successfully",
    id: result.lastInsertRowid
  });
});

// POST add supplier quote
router.post("/:id/quotes", (req, res) => {
  const rfqId = Number(req.params.id);

  const rfq = db.prepare(
    "SELECT * FROM rfqs WHERE id = ?"
  ).get(rfqId);

  if (!rfq) {
    return res.status(404).json({ message: "RFQ not found" });
  }

  const {
    supplierName,
    unitPrice,
    leadTimeDays,
    validUntil
  } = req.body;

  if (
    !supplierName?.trim() ||
    !Number.isFinite(unitPrice) ||
    unitPrice <= 0 ||
    !Number.isInteger(leadTimeDays) ||
    leadTimeDays < 0 ||
    !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)
  ) {
    return res.status(400).json({
      message: "Invalid supplier quote details"
    });
  }

  const result = db.prepare(`
    INSERT INTO quotes
    (rfqId, supplierName, unitPrice, leadTimeDays, validUntil, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    rfqId,
    supplierName.trim(),
    unitPrice,
    leadTimeDays,
    validUntil,
    new Date().toISOString()
  );

  res.status(201).json({
    message: "Supplier quote added successfully",
    id: result.lastInsertRowid
  });
});

export default router;
