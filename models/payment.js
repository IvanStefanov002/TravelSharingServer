const mongoose = require("mongoose");

const paymentShema = new mongoose.Schema({
  date_of_payment: { type: String, required: true },
  trid_id: { type: String, required: true },
  user_id: { type: String, required: true },
  amount: { type: Number, required: true },
});

module.exports = mongoose.model("Payment", paymentShema);
