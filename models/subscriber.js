const mongoose = require("mongoose");

const subscriberSchema = new mongoose.Schema({
  /* keys for all diferent properties of a subscriber */
  name: {
    type: String,
    required: true,
  },
  subscribedToChannel: {
    type: String,
    required: true,
  },
  subscribeDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

/* when we export this and inport in diferent file this model allows interacting with the database using this schema */
module.exports = mongoose.model("Subscriber", subscriberSchema);
