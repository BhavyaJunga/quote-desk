
export interface Quote {
  id: number;
  supplierName: string;
  unitPrice: number;
  leadTimeDays: number;
  validUntil: string;
  createdAt: string;
}

export interface RFQ {
  neededBy: string;
}

export function getBestQuote(
  rfq: RFQ,
  quotes: Quote[],
  today: string
): Quote | null {
  const eligibleQuotes = quotes.filter((quote) => {
    // Quote must still be valid.
    if (quote.validUntil < today) {
      return false;
    }

    // Calculate estimated arrival date.
    const arrivalDate = new Date(
      `${quote.createdAt.slice(0, 10)}T00:00:00Z`
    );

    arrivalDate.setUTCDate(
      arrivalDate.getUTCDate() + quote.leadTimeDays
    );

    const estimatedArrival = arrivalDate
      .toISOString()
      .slice(0, 10);

    // Quote must arrive by the required date.
    return estimatedArrival <= rfq.neededBy;
  });

  if (eligibleQuotes.length === 0) {
    return null;
  }

  // Cheapest eligible supplier wins.
  return eligibleQuotes.reduce((best, current) =>
    current.unitPrice < best.unitPrice ? current : best
  );
}
