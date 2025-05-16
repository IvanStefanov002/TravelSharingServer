const express = require("express");
const router = express.Router();
const Vehicle = require("../models/vehicle");

// GET /users - fetch all users
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
