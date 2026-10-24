const express = require('express');
const axios = require('axios');

const router = express.Router();

// Simple in-memory cache to keep charts working despite upstream rate limits
// Cache key: `${currency}`; stores last successful normalized payload
const PRICE_CACHE = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// GET /api/prices - real-time prices (INR per gram) from GoldPriceZ
router.get('/', async (req, res) => {
  try {
    const apiKey = process.env.GOLDPRICEZ_API_KEY || process.env.PRICE_API_KEY || '8b0ccbbd8aef9f598b98bb3ad273f4dd8b0ccbbd';
    const currency = String(req.query.currency || 'inr').toLowerCase(); // allow 'gbp' or 'inr'
    // Force source to goldapi (remove GoldPriceZ entirely)
    const source = 'goldapi';

    // Serve from cache if fresh
    const cacheKey = `${currency}`;
    const cached = PRICE_CACHE.get(cacheKey);
    if (cached && (Date.now() - cached._ts) < CACHE_TTL_MS) {
      return res.json(cached.payload);
    }
    let response;
    const tryGoldAPI = async () => {
      const goldApiToken = process.env.GOLDAPI_TOKEN || 'goldapi-pdixz26mhm8766q-io';
      // Prefer latest endpoint without date; if it fails, fall back to dated endpoint
      const base = `https://www.goldapi.io/api/XAU/${currency.toUpperCase()}`;
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const dateStr = `${y}${m}${d}`; // e.g., 20251130
      const urls = [base, `${base}/${dateStr}`];
      let lastErr;
      for (const u of urls) {
        try {
          const resp = await axios.get(u, {
            headers: {
              'x-access-token': goldApiToken,
              'Accept': 'application/json',
            },
            timeout: 10000,
          });
          return resp;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error('GoldAPI request failed');
    };
    const tryGoldAPISilver = async () => {
      const goldApiToken = process.env.GOLDAPI_TOKEN || 'goldapi-pdixz26mhm8766q-io';
      const base = `https://www.goldapi.io/api/XAG/${currency.toUpperCase()}`;
      // Try latest first, then fall back to today's dated endpoint (YYYYMMDD)
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      const dateStr = `${y}${m}${d}`;
      const urls = [base, `${base}/${dateStr}`];
      let lastErr;
      for (const u of urls) {
        try {
          const resp = await axios.get(u, {
            headers: {
              'x-access-token': goldApiToken,
              'Accept': 'application/json',
            },
            timeout: 10000,
          });
          return resp;
        } catch (e) {
          lastErr = e;
        }
      }
      throw lastErr || new Error('GoldAPI silver request failed');
    };

    // Removed GoldPriceZ usage entirely

    // Attempt GoldAPI, fallback to static values
    let provider = source;
    let silverResponse = null;
    try {
      response = await tryGoldAPI();
      silverResponse = await tryGoldAPISilver();
    } catch (primaryErr) {
      console.warn(`GoldAPI failed:`, primaryErr && primaryErr.message ? primaryErr.message : primaryErr);
      response = { data: {} }; // will use static fallback below
      provider = 'fallback';
    }

    const data = response.data || {};
    // Attempt to normalize structure from API
    // Expected fields may include: data.gold.price_gram, data.silver.price_gram
    let goldPrice =
      (data.gold && (data.gold.price_gram || data.gold.gram || data.gold.rate_gram)) ||
      (data.GOLD && (data.GOLD.price_gram || data.GOLD.gram || data.GOLD.rate_gram)) ||
      data.gold_price_gram ||
      data.goldRatePerGram ||
      null;
    let silverPrice =
      (data.silver && (data.silver.price_gram || data.silver.gram || data.silver.rate_gram)) ||
      (data.SILVER && (data.SILVER.price_gram || data.SILVER.gram || data.SILVER.rate_gram)) ||
      data.silver_price_gram ||
      data.silverRatePerGram ||
      null;

    // GoldAPI price is per troy ounce; convert to per gram (handle error payloads)
    if (response && response.config && String(response.config.url || '').includes('goldapi.io')) {
      const OZ_TO_GRAM = 31.1034768;
      // goldapi fields: price, open_price, close_price etc.
      const goldOunce = (data.error ? null : (data.price || data.close_price || data.open_price)) || null;
      if (!goldPrice && goldOunce) goldPrice = Number(goldOunce) / OZ_TO_GRAM;
      // goldapi silver endpoint not queried here; keep silver null
    }
    if (silverResponse && silverResponse.data) {
      const sd = silverResponse.data;
      const OZ_TO_GRAM = 31.1034768;
      const silverOunce = (sd.error ? null : (sd.price || sd.close_price || sd.open_price)) || null;
      if (!silverPrice && silverOunce) silverPrice = Number(silverOunce) / OZ_TO_GRAM;
    }

    let goldPerGram = Number(goldPrice) || 0;
    let silverPerGram = Number(silverPrice) || 0;
    if (!silverPerGram || silverPerGram <= 0) {
      const cached = PRICE_CACHE.get(`${currency}`);
      if (cached && cached.payload && cached.payload.silver && cached.payload.silver.price > 0) {
        silverPerGram = cached.payload.silver.price;
        provider = cached.payload.provider || provider;
      } else {
        silverPerGram = currency === 'gbp' ? 0.7 : 75;
      }
    }

    // If API returned 0 or invalid, use last cached or static fallback to keep chart working
    if (!goldPerGram || goldPerGram <= 0) {
      const cached = PRICE_CACHE.get(`${currency}`);
      if (cached && cached.payload && cached.payload.gold && cached.payload.gold.price > 0) {
        goldPerGram = cached.payload.gold.price;
        provider = cached.payload.provider || provider;
      } else {
        goldPerGram = currency === 'gbp' ? 60 : 6500;
        provider = 'fallback';
      }
    }

    // Karat purity factors (relative to 24k ~ 99.9% purity)
    const purity = {
      '24k': 1.0,
      '22k': 22 / 24,
      '18k': 18 / 24,
    };

    const result = {
      gold: { price: goldPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      silver: { price: silverPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      gold_10g_24k: Math.round(goldPerGram * 10 * purity['24k']),
      gold_10g_22k: Math.round(goldPerGram * 10 * purity['22k']),
      gold_10g_18k: Math.round(goldPerGram * 10 * purity['18k']),
      timestamp: new Date().toISOString(),
      provider,
      raw: data,
    };
    // Update cache and respond
    PRICE_CACHE.set(cacheKey, { _ts: Date.now(), payload: result });
    res.json(result);
  } catch (err) {
    console.warn('Price API failed, returning fallback:', err && err.message ? err.message : err);
    // Fallback mock data, adapt currency
    const currency = String(req.query.currency || 'inr').toLowerCase();
    const fallback = currency === 'gbp' ? { goldPerGram: 60, silverPerGram: 0.7 } : { goldPerGram: 6500, silverPerGram: 75 };
    const goldPerGram = fallback.goldPerGram;
    const silverPerGram = fallback.silverPerGram;
    const payload = {
      gold: { price: goldPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      silver: { price: silverPerGram, currency: currency.toUpperCase(), unit: 'gram' },
      gold_10g_24k: Math.round(goldPerGram * 10 * 1.0),
      gold_10g_22k: Math.round(goldPerGram * 10 * (22/24)),
      gold_10g_18k: Math.round(goldPerGram * 10 * (18/24)),
      timestamp: new Date().toISOString(),
      provider: 'fallback',
    };
    // Cache fallback too so chart remains smooth
    const cacheKey = `${currency}`;
    PRICE_CACHE.set(cacheKey, { _ts: Date.now(), payload });
    res.json(payload);
  }
});

module.exports = router;
// GET /api/prices/latest - expose latest per-gram and karat prices from cache
router.get('/latest', (req, res) => {
  const currency = String(req.query.currency || 'inr').toLowerCase();
  const cached = PRICE_CACHE.get(`${currency}`);
  if (cached && (Date.now() - cached._ts) < CACHE_TTL_MS) {
    return res.json(cached.payload);
  }
  // If not in cache, try to populate cache by calling the main handler logic
  // Reuse the same normalization by simulating a request to '/'
  const fakeReq = { query: { currency } };
  const fakeRes = {
    json: (payload) => {
      try {
        PRICE_CACHE.set(`${currency}`, { _ts: Date.now(), payload });
      } catch {}
      return res.json(payload);
    },
    status: (code) => ({ json: (obj) => res.status(code).json(obj) })
  };
  // Call the main route handler directly
  router.handle({ ...fakeReq, method: 'GET', url: '/' }, fakeRes);
});

// POST /api/prices/calc - calculate live price from weight and karat (24/22/18)
router.post('/calc', (req, res) => {
  try {
    const currency = String(req.query.currency || 'inr').toLowerCase();
    const { weight, karat } = req.body || {};
    if (!weight || !karat) return res.status(400).json({ error: 'Missing weight or karat' });
    const cached = PRICE_CACHE.get(`${currency}`);
    if (!cached || (Date.now() - cached._ts) >= CACHE_TTL_MS) {
      return res.status(503).json({ error: 'Price not ready. Please fetch /api/prices first.' });
    }
    const basePerGram = cached.payload.gold?.price || 0;
    const purity = karat === 24 ? 1.0 : karat === 22 ? 22/24 : karat === 18 ? 18/24 : null;
    if (!purity) return res.status(400).json({ error: 'Invalid karat. Use 24, 22, or 18.' });
    const livePrice = Math.round(basePerGram * weight * purity);
    return res.json({ currency: currency.toUpperCase(), unit: 'gram', weight, karat, price: livePrice });
  } catch (e) {
    return res.status(500).json({ error: 'Calculation error' });
  }
});
