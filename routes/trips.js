const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");

// // GET /trips - fetch all trips
// router.get("/", async (req, res) => {
//   try {
//     const trips = await Trip.find();
//     res.json(trips);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

/* create a trip */
router.post("/create", async (req, res) => {
  try {
    const {
      vehicle_image,
      trip_description,
      title,
      driver_id,
      profile_image,
      start_location,
      end_location,
      departure_datetime,
      available_seats,
      price_per_seat,
      checkout_options,
      is_pets_allowed,
      is_allowed_smoking,
    } = req.body;

    // Validate required fields (simple example)
    if (
      !vehicle_image ||
      !trip_description ||
      !driver_id ||
      !start_location?.city ||
      !end_location?.city ||
      available_seats === undefined ||
      price_per_seat === undefined
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newTrip = new Trip({
      vehicle_image,
      trip_description,
      title,
      driver_id,
      profile_image,
      start_location,
      end_location,
      departure_datetime,
      available_seats,
      price_per_seat,
      checkout_options: checkout_options || { card: [], cash: [] },
      is_pets_allowed: is_pets_allowed || "any",
      is_allowed_smoking: is_allowed_smoking || "any",
    });

    const savedTrip = await newTrip.save();
    res
      .status(201)
      .json({ message: "Trip created successfully", trip: savedTrip });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Server error while creating trip" });
  }
});

router.get("/", async (req, res) => {
  const { smoking, rating, seats } = req.query;

  const filter = {};

  if (smoking === "yes") filter.is_allowed_smoking = String("yes");
  else if (smoking === "no") filter.is_allowed_smoking = String("no");

  if (rating) filter.rating = Number(rating);
  if (seats) filter.available_seats = Number(seats);

  try {
    const trips = await Trip.find(filter);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/fetchData", async (req, res) => {
  try {
    const trips = await Trip.find(); // You could add filters here
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Server error fetching trips" });
  }
});

/* for TripDetails screen */
router.get("/:tripId", async (req, res) => {
  try {
    const { tripId } = req.params; // Extract tripId from URL parameter

    // Find the trip in the database by its ID
    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Return the trip data
    res.json(trip);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
