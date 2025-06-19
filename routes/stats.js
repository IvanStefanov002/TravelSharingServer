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
              $ifNull: ["$taken_seats_count", "0"],
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

router.get("/weeklyTrips", async (req, res) => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); /* Последните 7 дни */

    const weeklyData = await Trip.aggregate([
      {
        $addFields: {
          createdDate: {
            $toDate: "$created_on" /* ISO 8601 support */,
          },
        },
      },
      {
        $match: {
          createdDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdDate" } /* 1 (неделя) до 7 (събота) */,
          count: { $sum: 1 },
        },
      },
    ]);

    const dataByWeekday = Array(7).fill(0);
    weeklyData.forEach(({ _id, count }) => {
      const jsIndex = (_id + 5) % 7; /* Преобразуване от Mongo към JS ден */
      dataByWeekday[jsIndex] = count;
    });

    res.json({
      labels: ["Пон", "Вто", "Сря", "Чет", "Пет", "Съб", "Нед"],
      data: dataByWeekday,
    });
  } catch (err) {
    console.error("Error in /weeklyTrips:", err);
    res
      .status(500)
      .json({ error: "Грешка при извличването на данни за пътувания" });
  }
});

module.exports = router;
