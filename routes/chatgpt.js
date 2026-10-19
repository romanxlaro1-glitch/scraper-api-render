const express = require('express');
const router = express.Router();
const chatgptService = require('../services/chatgptService');

router.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await chatgptService.chat(prompt);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
