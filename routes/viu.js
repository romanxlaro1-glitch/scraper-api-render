const express = require('express');
const router = express.Router();
const viuService = require('../services/viuService');

router.get('/', async (req, res) => {
  try {
    const result = await viuService.getAccount(req.query.device_id);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
module.exports = router;
