const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findCoupons(site) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} }],
  });

  const prompt = `Find 3-5 currently active coupon codes for ${site}.
Return ONLY a JSON array of objects, nothing else.
Each object must have:
- "code": the coupon code string (uppercase)
- "expiry": the expiry date in YYYY-MM-DD format, or null if unknown

Example format:
[
  { "code": "SAVE20", "expiry": "2026-06-30" },
  { "code": "FREESHIP", "expiry": null }
]

Only include codes that are currently active. Do not include descriptions or any other text.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/s);
  if (!match) return [];

  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}

module.exports = { findCoupons };
