import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const CLOUD_URL = "http://cloud-backend:3005/data";

app.post("/data", async (req, res) => {
  const { bpm } = req.body;
  console.log(`[Boîtier] Received BPM: ${bpm}`);
  await fetch(CLOUD_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bpm }),
  });
  res.json({ status: "sent" });
});

app.listen(5000, () => console.log("[Boîtier] Running on port 5000"));
