import express from 'express';

const router = express.Router();
const GEO_API_URL = 'https://ipapi.co/json/';

router.get('/', async (req, res) => {
  try {
    const response = await fetch(GEO_API_URL);
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || 'Geo lookup failed' });
    }

    const body = await response.json();
    res.json(body);
  } catch (err) {
    console.error('Geo lookup error:', err);
    res.status(500).json({ error: 'Unable to fetch geolocation' });
  }
});

export default router;
