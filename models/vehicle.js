const mongoose = require("mongoose");

const vehicleShema = new mongoose.Schema({
  name: { type: String, required: true },
  car: {
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    plate: { type: String, required: true },
    mileage: { type: Number }, //not required
    fuel: { type: String },
    transmission: { type: String, required: true },
  },
});

module.exports = mongoose.model("Vehicle", vehicleShema);
