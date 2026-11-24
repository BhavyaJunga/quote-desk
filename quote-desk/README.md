# Quote Desk

A lightweight procurement application for managing Requests for Quotation (RFQs), collecting supplier quotations, and identifying the best eligible supplier based on price and delivery timelines.

## Features

- Create and manage RFQs.
- Add multiple supplier quotations to an RFQ.
- Track RFQ statuses: Open, Quoted, and Expired.
- Compare supplier prices and delivery timelines.
- Automatically identify the cheapest eligible supplier.
- Exclude expired quotations and suppliers unable to meet delivery deadlines.
- Persist RFQs and quotations using SQLite.

## Technology Stack

**Frontend**
- React
- TypeScript
- Vite
- CSS

**Backend**
- Node.js
- Express
- TypeScript
- SQLite
- better-sqlite3

**Testing**
- Vitest

## Project Structure

```text
quote-desk/
├── client/
│   └── src/
│       ├── services/
│       ├── App.tsx
│       ├── App.css
│       └── main.tsx
│
├── server/
│   ├── src/
│   │   ├── database/
│   │   ├── routes/
│   │   ├── services/
│   │   └── index.ts
│   ├── tests/
│   └── data/
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm

### 1. Start the backend

```bash
cd server
npm install
npm run dev
```

The backend runs at:

`http://localhost:5000`

### 2. Start the frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The frontend runs at:

`http://localhost:5173`

Open the frontend URL in your browser.

## Business Rules

### RFQ Status

- **Open:** No supplier quotations have been received.
- **Quoted:** At least one supplier quotation is currently valid.
- **Expired:** The RFQ's needed-by date has passed, or all supplier quotations have expired.

### Best Quote Selection

The best quote is the lowest-priced quotation that satisfies both conditions:

1. The quotation is still valid.
2. The supplier can deliver on or before the RFQ's needed-by date.

A cheaper quotation is not selected if its estimated delivery date is later than the required date.

## Database

The application uses SQLite for persistent storage.

The database stores:
- RFQ details.
- Supplier quotation details.
- Creation timestamps.

Data is retained when the backend application restarts.

## Running Tests

From the server directory:

```bash
npm test
```

The current automated tests cover:

- Selecting the cheapest eligible supplier.
- Returning no best quote when no supplier is eligible.
- Accepting delivery exactly on the required date.

## Current Test Results

All 3 automated tests are passing.

## Assumptions and Scope

- Supplier delivery time is measured in calendar days.
- Estimated arrival is calculated using the quotation creation date and supplier lead time.
- Prices are compared using the quoted unit price in INR.
- A quotation remains valid through its valid-until date.
- The application is designed as a focused RFQ and supplier quotation management workflow.

## What I Would Improve With One More Day

- Add more automated tests for RFQ status and edge cases.
- Improve date and input validation.
- Add editing and deletion of RFQs and quotations.
- Add filtering and sorting of RFQs.
- Improve accessibility and responsive table interactions.
- Add centralized error handling and stronger API validation.
- Add deployment configuration and production environment settings.

## Future Enhancements

- Supplier management and authentication.
- Export quotation comparisons.
- Procurement analytics and reporting.
- Role-based access control.
