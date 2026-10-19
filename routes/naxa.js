const express = require('express');
const router = express.Router();
const naxaService = require('../services/naxaService');

router.post('/', async (req, res) => {
  try {
    const { action, email, password, message, token } = req.body;
    let result;
    if (action === 'register') result = await naxaService.register(email, password);
    else if (action === 'login') result = await naxaService.login(email, password);
    else if (action === 'chat') result = await naxaService.chat(token, message);
    else throw new Error("Invalid action");
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
