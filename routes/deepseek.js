const express = require('express');
const router = express.Router();
const deepseekService = require('../services/deepseekService');

router.post('/', async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const result = await deepseekService.chat(prompt, model);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
