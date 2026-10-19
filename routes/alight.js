const express = require('express');
const router = express.Router();
const alightService = require('../services/alightService');

router.post('/', async (req, res) => {
  try {
    const { action } = req.body;
    const result = await alightService.generate(action);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
