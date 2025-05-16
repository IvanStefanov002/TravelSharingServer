const express = require("express");
const router = express.Router();
const Payment = require("../models/payment");

// GET /payments - fetch all payments
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
