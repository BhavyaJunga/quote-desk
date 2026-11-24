
import { useEffect, useState, type FormEvent } from "react";
import {
  getRFQs,
  createRFQ,
  addQuote,
  type RFQ
} from "./services/api";
import "./App.css";

function App() {
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showRFQForm, setShowRFQForm] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<number | null>(null);
  const [viewRFQ, setViewRFQ] = useState<RFQ | null>(null);

  async function loadRFQs() {
    try {
      setError("");
      const data = await getRFQs();
      setRfqs(data);
    } catch {
      setError("Unable to load RFQs. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRFQs();
  }, []);

  async function handleCreateRFQ(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    try {
      await createRFQ({
        partNumber: String(form.get("partNumber")),
        description: String(form.get("description")),
        quantity: Number(form.get("quantity")),
        neededBy: String(form.get("neededBy"))
      });

      setShowRFQForm(false);
      await loadRFQs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create RFQ");
    }
  }

  async function handleAddQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    if (selectedRFQ === null) return;

    try {
      await addQuote(selectedRFQ, {
        supplierName: String(form.get("supplierName")),
        unitPrice: Number(form.get("unitPrice")),
        leadTimeDays: Number(form.get("leadTimeDays")),
        validUntil: String(form.get("validUntil"))
      });

      setSelectedRFQ(null);
      await loadRFQs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add quote");
    }
  }

  const quotedCount = rfqs.filter(r => r.status === "Quoted").length;
  const openCount = rfqs.filter(r => r.status === "Open").length;
  const expiredCount = rfqs.filter(r => r.status === "Expired").length;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">Q</span>
          <span>Quote Desk</span>
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <div className="nav-item active">▦ &nbsp; Dashboard</div>
        <div className="nav-item">▤ &nbsp; All RFQs</div>

        <div className="sidebar-bottom">
          <div className="profile-avatar">B</div>
          <div>
            <strong>Bhavya</strong>
            <small>Procurement Team</small>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="breadcrumb">Workspace / Dashboard</p>
            <h1>Procurement Dashboard</h1>
            <p className="subtitle">
              Manage requests and compare supplier quotations.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => setShowRFQForm(true)}
          >
            + Create RFQ
          </button>
        </header>

        {error && <div className="error">{error}</div>}

        <section className="stats">
          <div className="stat-card">
            <span>Total RFQs</span>
            <strong>{rfqs.length}</strong>
            <small>All requests</small>
          </div>

          <div className="stat-card">
            <span>Open</span>
            <strong>{openCount}</strong>
            <small>Awaiting quotations</small>
          </div>

          <div className="stat-card">
            <span>Quoted</span>
            <strong>{quotedCount}</strong>
            <small>Valid supplier quotes</small>
          </div>

          <div className="stat-card">
            <span>Expired</span>
            <strong>{expiredCount}</strong>
            <small>Past deadline or validity</small>
          </div>
        </section>

        <section className="table-section">
          <div className="section-header">
            <div>
              <h2>Recent RFQs</h2>
              <p>Track your requests for quotation.</p>
            </div>
            <span className="count">{rfqs.length} requests</span>
          </div>

          {loading ? (
            <p className="empty">Loading RFQs...</p>
          ) : rfqs.length === 0 ? (
            <div className="empty">
              <h3>No RFQs yet</h3>
              <p>Create your first request to get started.</p>
              <button
                className="primary-btn"
                onClick={() => setShowRFQForm(true)}
              >
                Create your first RFQ
              </button>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>PART NUMBER</th>
                    <th>DESCRIPTION</th>
                    <th>QUANTITY</th>
                    <th>NEEDED BY</th>
                    <th>QUOTES</th>
                    <th>BEST PRICE</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.map(rfq => (
                    <tr key={rfq.id}>
                      {/* <td><strong>{rfq.partNumber}</strong></td> */}
                      <td>
                        <button
                          className="text-btn"
                          onClick={() => setViewRFQ(rfq)}>
                          <strong>{rfq.partNumber}</strong>
                          </button>
                      </td>
                      <td>{rfq.description}</td>
                      <td>{rfq.quantity}</td>
                      <td>{rfq.neededBy}</td>
                      <td>{rfq.quotes.length}</td>
                      <td>
                        {rfq.bestQuote
                          ? `₹${rfq.bestQuote.unitPrice.toLocaleString("en-IN")}`
                          : "—"}
                      </td>
                      <td>
                        <span className={`status ${rfq.status.toLowerCase()}`}>
                          {rfq.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="text-btn"
                          onClick={() => setSelectedRFQ(rfq.id)}
                        >
                          + Add quote
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {showRFQForm && (
          <div className="overlay">
            <form className="modal" onSubmit={handleCreateRFQ}>
              <h2>Create new RFQ</h2>
              <p>Enter the part requirements.</p>

              <label>Part number</label>
              <input name="partNumber" required placeholder="e.g. PART-001" />

              <label>Description</label>
              <input name="description" required placeholder="Part description" />

              <label>Quantity</label>
              <input name="quantity" type="number" min="1" required />

              <label>Needed by</label>
              <input name="neededBy" type="date" required />

              <div className="form-actions">
                <button type="button" className="secondary-btn"
                  onClick={() => setShowRFQForm(false)}>
                  Cancel
                </button>
                <button className="primary-btn" type="submit">
                  Create RFQ
                </button>
              </div>
            </form>
          </div>
        )}

        {selectedRFQ !== null && (
          <div className="overlay">
            <form className="modal" onSubmit={handleAddQuote}>
              <h2>Add supplier quote</h2>
              <p>RFQ #{selectedRFQ}</p>

              <label>Supplier name</label>
              <input name="supplierName" required placeholder="Supplier name" />

              <label>Unit price (INR)</label>
              <input name="unitPrice" type="number" min="0.01"
                step="0.01" required />

              <label>Lead time (days)</label>
              <input name="leadTimeDays" type="number" min="0" required />

              <label>Valid until</label>
              <input name="validUntil" type="date" required />

              <div className="form-actions">
                <button type="button" className="secondary-btn"
                  onClick={() => setSelectedRFQ(null)}>
                  Cancel
                </button>
                <button className="primary-btn" type="submit">
                  Save quote
                </button>
              </div>
            </form>
          </div>
        )}
        {viewRFQ !== null && (
  <div className="overlay">
    <div className="modal rfq-details">
      <div className="section-header">
        <div>
          <h2>RFQ Details</h2>
          <p>{viewRFQ.partNumber}</p>
        </div>

        <button
          className="secondary-btn"
          onClick={() => setViewRFQ(null)}
        >
          Close
        </button>
      </div>

      <div className="rfq-info">
        <p><strong>Description:</strong> {viewRFQ.description}</p>
        <p><strong>Quantity:</strong> {viewRFQ.quantity}</p>
        <p><strong>Needed by:</strong> {viewRFQ.neededBy}</p>
        <p><strong>Status:</strong> {viewRFQ.status}</p>
      </div>

      <h3>Supplier Quotations ({viewRFQ.quotes.length})</h3>

      {viewRFQ.quotes.length === 0 ? (
        <p>No supplier quotes received yet.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SUPPLIER</th>
                <th>UNIT PRICE</th>
                <th>LEAD TIME</th>
                <th>VALID UNTIL</th>
              </tr>
            </thead>
            <tbody>
              {viewRFQ.quotes.map(quote => (
                <tr key={quote.id}>
                  <td>{quote.supplierName}</td>
                  <td>
                    ₹{quote.unitPrice.toLocaleString("en-IN")}
                  </td>
                  {/* <td>{quote.leadTimeDays} days</td> */}
                  <td>
                    {quote.leadTimeDays} {" "}
                    {quote.leadTimeDays === 1 ? "day" : "days"}
                  </td>
                  <td>{quote.validUntil}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="best-quote">
        <h3>Best Eligible Quote</h3>

        {viewRFQ.bestQuote ? (
          <>
            <h2>
              ₹{viewRFQ.bestQuote.unitPrice.toLocaleString("en-IN")}
            </h2>
            <p>{viewRFQ.bestQuote.supplierName}</p>
            <p>
              Delivery: {viewRFQ.bestQuote.leadTimeDays} {" "}
              {viewRFQ.bestQuote.leadTimeDays === 1 ? "day" : "days"}
            </p>
          </>
        ) : (
          <p>No eligible supplier quote available.</p>
        )}

      </div>
      <div className="form-actions">
        <button
          className="secondary-btn"
          onClick={() => setViewRFQ(null)}>
          Close
        </button>
        <button
          className="primary-btn"
          onClick={() => {
            setSelectedRFQ(viewRFQ.id);
            setViewRFQ(null);
          }}>
          + Add another quote
        </button>
      </div>
    </div>
  </div>
  )}
      </main>
    </div>
  );
}

export default App;
