const express = require("express");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { meal } = req.body;

    if (!meal) {
      return res.status(400).json({
        message: "Please enter a meal name",
      });
    }

    const prompt = `
You are an ingredient assistant for a shopping list application.

The user wants to make this meal: ${meal}

Return ONLY valid JSON in exactly this format:

{
  "meal": "meal name",
  "ingredients": [
    {
      "name": "ingredient name",
      "quantity": "quantity"
    }
  ]
}

Give commonly required ingredients and reasonable quantities
for approximately 2-4 people.

Do not include cooking instructions.
Do not include explanations.
Do not use markdown.
Do not put the JSON inside a code block.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    const text = response.text;

    const result = JSON.parse(text);

    res.json(result);
  } catch (error) {
    console.error("Gemini Error:", error);

    res.status(500).json({
      message: "Failed to generate ingredients",
    });
  }
});

module.exports = router;