import express from "express";

const app = express();
app.use(express.json());

app.post("/send", (req, res) => {
  const { numbers, message } = req.body;
  console.log(`[SMS SERVER] Would send SMS to ${numbers.join(", ")}: ${message}`);
  res.json({ status: "logged" });
});

app.listen(7000, () => console.log("[SMS] Running on port 7000"));
