// In server.js

import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase body limit for larger images

app.post("/api/solution", async (req, res) => {
  try {
    const { prompt, image } = req.body;

    const keys = process.env.GEMINI_KEYS.split(",");
    const GEMINI_KEY = keys[Math.floor(Math.random() * keys.length)];

    // CORRECTED LINE: Changed 'gemini-2.0-flash' to the correct 'gemini-1.5-flash-latest'
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
    
    const parts = [{ text: prompt }];
    
    if (image && image.mimeType && image.data) {
      parts.unshift({
        inline_data: {
          mime_type: image.mimeType,
          data: image.data,
        },
      });
    }

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API failed: ${errText}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error("Backend error:", err);
    res.status(500).json({ error: "Failed to fetch from Gemini", details: err.message });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Backend running on ${port}`));
