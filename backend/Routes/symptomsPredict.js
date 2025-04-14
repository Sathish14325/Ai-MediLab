// backend/routes/predict.js
import express from "express";
import axios from "axios";
const router = express.Router();

router.post("/predict", async (req, res) => {
  try {
    const { symptoms } = req.body;
    const response = await axios.post("http://localhost:1000/api/predict", {
      symptoms,
    });
    res.json(response.data);
  } catch (error) {
    console.error("Prediction error:", error.message);
    res.status(500).json({ error: "Prediction failed" });
  }
});

export default router;
