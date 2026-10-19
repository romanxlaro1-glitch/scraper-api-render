const express = require('express');
const router = express.Router();
const kiyoraService = require('../services/kiyoraService');

router.post('/', async (req, res) => {
  try {
    const { prompt, sessionId, action } = req.body;
    let result;
    if (action === 'reset') result = kiyoraService.reset(sessionId);
    else result = await kiyoraService.chat(prompt, sessionId);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
