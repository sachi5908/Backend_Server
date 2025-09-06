import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/solution", async (req, res) => {
  try {
    const { prompt, imageUrl } = req.body;

    // Get a random key from the list
    const keys = process.env.GEMINI_KEYS.split(",");
    const GEMINI_KEY = keys[Math.floor(Math.random() * keys.length)];

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

    const parts = [{ text: prompt }];
    if (imageUrl) {
      parts.unshift({ inline_data: { mime_type: "image/png", data: imageUrl } });
    }

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }] })
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
