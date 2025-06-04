const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   credentials: {
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     //username: { type: String, required: true },
//     phone: { type: String, required: true },
//     verified: { type: Boolean, required: true },
//   },
//   dateOfBirth: { type: Date },
//   //age: { type: Number },
//   vehicles: [
//     {
//       imageUrl: String,
//       make: String,
//       model: String,
//       year: Number,
//       color: String,
//       plate: String,
//     },
//   ],
//   ratings: {
//     average: Number,
//     count: Number,
//   },
//   //driving_experience_in_years: Number,
//   //role: String,
//   trips_count: Number,
//   roles: {
//     role_1: String,
//     role_2: String,
//   },
//   profile_image: { type: String },
// });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  credentials: {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //username: { type: String }, // optional
    phone: { type: String, required: true },
    verified: { type: Boolean, required: true, default: false },
  },

  dateOfBirth: { type: Date },
  // age: { type: Number }, // optional: can be computed from dateOfBirth
  vehicles: [
    {
      imageUrl: { type: String, default: "" },
      make: { type: String, default: "" },
      model: { type: String, default: "" },
      year: { type: Number, default: 0 },
      color: { type: String, default: "" },
      plate: { type: String, default: "" },
    },
  ],

  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },

  //driving_experience_in_years: { type: Number, default: 0 }, // optional
  trips_count: { type: Number, default: 0 },

  roles: { type: [String], default: ["passenger"] },

  profile_image: { type: String, default: "/uploads/no_image.jpeg" },
});

module.exports = mongoose.model("User", userSchema);
