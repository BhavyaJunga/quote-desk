
const API_URL = "http://localhost:5000/api";

export interface Quote {
  id: number;
  rfqId: number;
  supplierName: string;
  unitPrice: number;
  leadTimeDays: number;
  validUntil: string;
  createdAt: string;
}

export interface RFQ {
  id: number;
  partNumber: string;
  description: string;
  quantity: number;
  neededBy: string;
  createdAt: string;
  status: "Open" | "Quoted" | "Expired";
  quotes: Quote[];
  bestQuote: Quote | null;
}

export async function getRFQs(): Promise<RFQ[]> {
  const response = await fetch(`${API_URL}/rfqs`);

  if (!response.ok) {
    throw new Error("Failed to fetch RFQs");
  }

  return response.json();
}

export async function createRFQ(data: {
  partNumber: string;
  description: string;
  quantity: number;
  neededBy: string;
}) {
  const response = await fetch(`${API_URL}/rfqs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create RFQ");
  }

  return response.json();
}

export async function addQuote(
  rfqId: number,
  data: {
    supplierName: string;
    unitPrice: number;
    leadTimeDays: number;
    validUntil: string;
  }
) {
  const response = await fetch(`${API_URL}/rfqs/${rfqId}/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add quote");
  }

  return response.json();
}
