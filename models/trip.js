const mongoose = require("mongoose");

// Define the Trip schema
const tripSchema = new mongoose.Schema({
  vehicle_image: { type: String, required: true },
  trip_description: { type: String, required: true },
  title: { type: String },
  driver_id: { type: String, required: true },
  profile_image: { type: String },
  start_location: {
    city: { type: String, required: true },
    address: { type: String },
    coordinates: { type: [Number], index: "2dsphere" }, // Using the '2dsphere' index for geospatial queries
  },
  departure_datetime: { type: String },
  available_seats: { type: Number, required: true },
  price_per_seat: { type: Number, required: true },
  checkout_options: {
    card: [{ type: String }],
    cash: [{ type: String }],
  },
  is_pets_allowed: { type: String, enum: ["yes", "no", "any"], default: "any" }, // Added 'enum' for valid options
  is_allowed_smoking: {
    type: String,
    enum: ["yes", "no", "any"],
    default: "any",
  },
  rating: { type: Number, min: 0, max: 5 },
  taken_seats: [{ type: String }],
  article_status: {
    type: String,
    enum: ["available", "finished"],
    default: "available",
  },
  taken_seats_count: { type: Number, default: 0 },
  end_location: {
    city: { type: String, required: true },
    address: { type: String },
    coordinates: { type: [Number], index: "2dsphere" },
  },
});

// Create and export the Trip model based on the schema
module.exports = mongoose.model("Trip", tripSchema);
