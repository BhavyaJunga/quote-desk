
import { describe, it, expect } from "vitest";
import { getBestQuote } from "../src/services/quoteService";

describe("getBestQuote", () => {
  const rfq = {
    neededBy: "2026-11-30"
  };

  const today = "2026-11-20";

  const quotes = [
    {
      id: 1,
      supplierName: "Supplier A",
      unitPrice: 300,
      leadTimeDays: 20,
      validUntil: "2026-12-10",
      createdAt: "2026-11-20T10:00:00.000Z"
    },
    {
      id: 2,
      supplierName: "Supplier B",
      unitPrice: 400,
      leadTimeDays: 7,
      validUntil: "2026-12-05",
      createdAt: "2026-11-20T10:00:00.000Z"
    },
    {
      id: 3,
      supplierName: "Supplier C",
      unitPrice: 500,
      leadTimeDays: 5,
      validUntil: "2026-11-19",
      createdAt: "2026-11-20T10:00:00.000Z"
    }
  ];

  it("selects the cheapest quote that can arrive on time", () => {
    const result = getBestQuote(rfq, quotes, today);

    expect(result?.supplierName).toBe("Supplier B");
    expect(result?.unitPrice).toBe(400);
  });

  it("returns null when no quote is eligible", () => {
    const result = getBestQuote(
      { neededBy: "2026-11-25" },
      quotes,
      today
    );

    expect(result).toBeNull();
  });

  it("accepts delivery exactly on the needed-by date", () => {
    const result = getBestQuote(
      { neededBy: "2026-11-27" },
      [quotes[1]],
      today
    );

    expect(result?.supplierName).toBe("Supplier B");
  });
});
