const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Trip = require("../models/trip");

router.get("/summary", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTrips = await Trip.countDocuments();

    const totalPassengersAgg = await Trip.aggregate([
      {
        $project: {
          passengerCount: {
            $toInt: {
              $ifNull: ["$taken_seats_count", "0"], // Default to "0" if null
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: "$passengerCount" },
        },
      },
    ]);

    res.json({
      totalUsers,
      totalTrips,
      totalPassengers: totalPassengersAgg[0]?.count || 0,
    });
  } catch (err) {
    console.error("Stats error:", err);
    res.status(500).json({ message: "Failed to get stats" });
  }
});

module.exports = router;
