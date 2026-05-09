const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function findCoupons(site) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{ googleSearch: {} }],
  });

  const prompt = `Find current working coupon codes for ${site}.
  Return ONLY a JSON array of coupon code strings, nothing else.
  Example format: ["CODE1", "CODE2", "CODE3"]
  Only include the actual coupon codes, not descriptions or expiry dates.`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON array from response
  const match = text.match(/\[.*?\]/s);
  if (!match) return [];

  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}

module.exports = { findCoupons };
