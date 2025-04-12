import express from "express";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
const router = express.Router({ mergeParams: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pythonScriptPathForSymptoms = path.join(__dirname, "../symptoms.py");
const symptomsModel = path.join(__dirname, "../aimodels/svc.pkl");

router.post("/symptoms", (req, res) => {
  let responseSent = false; // Flag to track if response has been sent

  try {
    const rawData = req.body.data;
    const symptomsArray =
      typeof rawData === "string"
        ? rawData.split(",").map((s) => s.trim())
        : rawData;

    const pythonProcess = spawn("python", [
      pythonScriptPathForSymptoms,
      "--loads",
      symptomsModel,
      JSON.stringify({ data: symptomsArray }),
    ]);

    let outputBuffer = "";

    pythonProcess.stdout.on("data", (data) => {
      outputBuffer += data.toString();
    });

    pythonProcess.on("close", (code) => {
      try {
        const prediction = JSON.parse(outputBuffer);
        res.json({ data: prediction });
      } catch (err) {
        console.error("Error parsing Python output:", err);
        res.status(500).send("Error parsing Python output");
      }
    });

    {
      // let prediction;
      // pythonProcess.stdout.on("data", (data) => {
      //   const dataString = data.toString();
      //   console.log("Python script output===========:", JSON.parse(dataString));
      //   prediction = JSON.parse(dataString);
      // });
      // pythonProcess.stderr.on("data", (data) => {
      //   console.error("Python script error:", data.toString());
      // });
      // pythonProcess.on("close", (code) => {
      //   console.log("Python process closed with code:", code);
      //   console.log("Prediction:", prediction);
      //   if (!responseSent) {
      //     res.json({ data: prediction });
      //     responseSent = true;
      //   }
      // });
      // pythonProcess.on("error", (error) => {
      //   console.error("Python process error:", error);
      //   if (!responseSent) {
      //     res.status(500).send("Internal Server Error");
      //     responseSent = true;
      //   }
      // });
    }
  } catch (error) {
    console.error("Error:", error);
    if (!responseSent) {
      responseSent = true;
      return res.status(500).send("Internal Server Error");
    }
  }
});

export default router;
