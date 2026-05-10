const express = require("express");
const LRUCache = require("./lruCache");
const { findCoupons } = require("./gemini");
require("dotenv").config();
const ALLOWED_SITES = new Set([
  "asos", "hm", "nike", "gap", "oldnavy", 
  "target", "shein", "macys", "ebay", "nordstrom"
]);
function getNodeExpiry(coupons){
  max_date = new Date()
  max_date.setDate(max_date.getDate()+30)
  for(const coupon of coupons){
    const expiryMs = coupon.expiry ? new Date(coupon.expiry).getTime() : max_date.getTime();
    max_date = new Date(Math.max(expiryMs, max_date.getTime()));
  }
  return max_date-Date.now()
}
const app = express();
const PORT = 3000;
const cache = new LRUCache(100); // store up to 100 products

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/coupons", async (req, res) => {
  const { site } = req.query;

  if (!site) {
    return res.status(400).json({ error: "Missing site" });
  }
  if(!ALLOWED_SITES.has(site)){
    return res.status(400).json({ error: "Site not currently supported" });
    
  }

  const cacheKey = site;

  // Check cache first
  const cached = cache.get(cacheKey,coupon =>!coupon.expiry || new Date(coupon.expiry) > new Date());
  if (cached) {
    console.log("Cache hit:", cacheKey);
    return res.json({ site, coupons: cached, source: "cache" });
    }
    

  // Cache miss — ask Gemini
  console.log("Cache miss:", cacheKey);
  try {
    const coupons = await findCoupons(site);
    cache.put(cacheKey, coupons, getNodeExpiry(coupons));
    res.json({ site, coupons, source: "gemini" });
  } catch (err) {
    console.error("Gemini error:", err.message);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
});

app.listen(PORT, () => {
  console.log(`CouponFinder backend running on port ${PORT}`);
});

