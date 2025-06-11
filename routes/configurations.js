const express = require("express");
const router = express.Router();

const Configuration = require("../models/configuration");

/* JWT */
const verifyToken = require("./../middleware/auth");

/* fetch Google API key using JWT authorization */
router.get("/fetchGoogleAPIKey", verifyToken, async (req, res) => {
  try {
    const configDoc = await Configuration.findOne();
    if (!configDoc || !configDoc.Google || !configDoc.Google.google_api_key) {
      return res.status(404).json({ message: "Google API key not found" });
    }

    res.status(200).json({ google_api_key: configDoc.Google.google_api_key });
  } catch (error) {
    console.error("Error fetching configurations:", error);
    res.status(500).json({ message: "Server error fetching configurations" });
  }
});

router.get("/fetchClientIds", verifyToken, async (req, res) => {
  try {
    const configDoc = await Configuration.findOne();

    if (
      !configDoc ||
      !configDoc.Google ||
      !configDoc.Google.android_client_id ||
      !configDoc.Google.ios_client_id ||
      !configDoc.Google.web_client_id
    ) {
      return res.status(404).json({ message: "Client ids are not found" });
    }

    res.status(200).json({
      android_client_id: configDoc.Google.android_client_id,
      ios_client_id: configDoc.Google.ios_client_id,
      web_client_id: configDoc.Google.web_client_id,
    });
  } catch (error) {
    console.error("Error fetching configurations:", error);
    res.status(500).json({ message: "Server error fetching configurations" });
  }
});

module.exports = router;
