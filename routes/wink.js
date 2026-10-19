const express = require('express');
const router = express.Router();
const winkService = require('../services/winkService');

router.post('/', async (req, res) => {
  try {
    const { imageUrl, mode } = req.body;
    const result = await winkService.upscale(imageUrl, mode);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
