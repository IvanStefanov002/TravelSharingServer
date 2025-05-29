const express = require("express");
const router = express.Router();
const Trip = require("../models/trip");
const User = require("../models/user");

/* JWT */
const verifyToken = require("./../middleware/auth");

/* update trip status */
router.post("/updateStatus", async (req, res) => {
  try {
    const { id, status } = req.body;

    /* validate fields */
    if (!id || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: id },
      { article_status: status },
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: `Trip with id[${id}] not found` });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Update successful",
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Server error while updating trip" });
  }
});

/* Manually book a trip */
router.post("/bookManual", async (req, res) => {
  try {
    const { tripId, names, email, phone } = req.body;

    /* Validate fields */
    if (!names || !email || !phone) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    /* Check if user already exists */
    let existingUser = await User.findOne({ "credentials.email": email });

    let userId;

    if (!existingUser) {
      /* Create a new user */
      const newUser = new User({
        profile_image: "/uploads/unkown.jpeg",
        name: names,
        credentials: {
          email,
          phone,
          username: email.split("@")[0] + Math.floor(Math.random() * 10000),
          password: "manual_booking_password", // You may want to hash this or flag manual accounts separately
          verified: false,
        },
        role: "passenger" /* default role */,
        trips_count: 0,
      });

      const savedUser = await newUser.save();
      userId = savedUser._id;
    } else {
      userId = existingUser._id;
    }

    // Update trip with userId
    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: tripId },
      {
        $inc: {
          available_seats: -1,
          taken_seats_count: 1,
        },
        $addToSet: {
          taken_seats: userId, // Prevent duplicate userIds
        },
      },
      { new: true }
    );

    if (!updatedTrip) {
      return res
        .status(404)
        .json({ message: `Trip with id [${tripId}] not found` });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Trip booked successfully",
      userId,
    });
  } catch (error) {
    console.error("Error booking trip manually:", error);
    res.status(500).json({ message: "Server error while booking trip" });
  }
});

/* Book trip */
router.post("/book", async (req, res) => {
  try {
    const { tripId, userId } = req.body;

    // Validate fields
    if (!tripId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Use $inc and $push for atomic updates
    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: tripId },
      {
        $inc: {
          available_seats: -1,
          taken_seats_count: 1,
        },
        $addToSet: {
          taken_seats: userId, // Prevent duplicate userIds
        },
      },
      { new: true }
    );

    if (!updatedTrip) {
      return res
        .status(404)
        .json({ message: `Trip with id [${tripId}] not found` });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Trip booked successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Server error while booking trip" });
  }
});

/* Cancel booking */
router.post("/unbook", async (req, res) => {
  try {
    const { tripId, userId } = req.body;

    // Validate fields
    if (!tripId || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Use $inc and $push for atomic updates
    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: tripId },
      {
        $inc: {
          available_seats: 1,
          taken_seats_count: -1,
        },
        $pull: {
          taken_seats: userId,
        },
      },
      { new: true }
    );

    if (!updatedTrip) {
      return res
        .status(404)
        .json({ message: `Trip with id [${tripId}] not found` });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Trip booked successfully",
      trip: updatedTrip,
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Server error while booking trip" });
  }
});

// Get all trips where user is either a driver or a participant
router.get("/fetchData/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    const trips = await Trip.find({
      $or: [{ driver_id: userId }, { taken_seats: userId }],
    });

    if (!trips || trips.length === 0) {
      return res.status(404).json({ message: "No trips found for this user" });
    }

    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* create a trip */
router.post("/create", async (req, res) => {
  try {
    const {
      created_on,
      title,
      trip_description,
      vehicle_image,
      car,
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

    console.log(`vehicle_image`, vehicle_image);
    if (
      !vehicle_image ||
      !trip_description ||
      !driver_id ||
      !start_location?.city ||
      !end_location?.city ||
      available_seats === undefined ||
      price_per_seat === undefined
    ) {
      console.log("missing required fields");
      return res.status(400).json({ message: "Missing required fields" });
    }

    console.log("before new trip");
    const newTrip = new Trip({
      created_on,
      vehicle_image,
      trip_description,
      title,
      car,
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

    console.log(`newTrip`, newTrip);
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

/*
router.get("/fetchData", async (req, res) => {
  try {
    const trips = await Trip.find(); // You could add filters here
    res.status(200).json(trips);
  } catch (error) {
    console.error("Error fetching trips:", error);
    res.status(500).json({ message: "Server error fetching trips" });
  }
});
*/

/* fetch Trip data using JWT authorization */
router.get("/fetchData", verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find();
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
