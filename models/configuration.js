const mongoose = require("mongoose");

const configSchema = new mongoose.Schema({
  Google: {
    android_client_id: { type: String },
    ios_client_id: { type: String },
    web_client_id: { type: String },
    google_api_key: { type: String },
  },
});

module.exports = mongoose.model("Configuration", configSchema);
