
import express from "express";
import cors from "cors";
import rfqRoutes from "./routes/rfqRoutes.js";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    message: "Quote Desk API is running"
  });
});

app.use("/api/rfqs", rfqRoutes);

app.listen(PORT, () => {
  console.log(
    `Quote Desk API running at http://localhost:${PORT}`
  );
});
