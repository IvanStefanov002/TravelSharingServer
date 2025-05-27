const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credentials: {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    phone: { type: String, required: true },
    verified: { type: Boolean, required: true },
  },
  dateOfBirth: { type: Date },
  age: { type: Number },
  vehicles: [
    {
      imageUrl: String,
      make: String,
      model: String,
      year: Number,
      color: String,
      plate: String,
    },
  ],
  ratings: {
    average: Number,
    count: Number,
  },
  driving_experience_in_years: Number,
  role: String,
  trips_count: Number,
  roles: {
    role_1: String,
    role_2: String,
  },
  profile_image: { type: String },
});

module.exports = mongoose.model("User", userSchema);
