const express = require("express");
const multer = require("multer"); /* for storing images */
const fs = require("fs"); /* for old image deletion */
const path = require("path");
const router = express.Router();
const User = require("../models/user");
const Trip = require("../models/trip");
require("dotenv").config();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// router.post("/image/createTrip", upload.single("image"), async (req, res) => {
//   try {
//     const oldImageFileName = req.body.oldImage;
//     const email = req.body.email;
//     if (!req.file || !email) {
//       return res.status(400).json({ message: "Image and email are required" });
//     }

//     //const imageUrl = `${req.protocol}://${req.get("host")}/uploads/$
//     const imageUrl = `${req.protocol}://localhost:${process.env.PORT}/uploads/${req.file.filename}`;

//     // Update user's car.image_url
//     const updatedTrip = await User.findOneAndUpdate(
//       { "credentials.email": email },
//       { "car.image_url": imageUrl },
//       { new: true }
//     );

//     if (!updatedTrip) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* delete old image as new is already set */
//     if (oldImageFileName && oldImageFileName !== "logo.png") {
//       const oldImagePath = path.join(
//         __dirname,
//         "..",
//         "uploads",
//         oldImageFileName
//       );
//       fs.access(oldImagePath, fs.constants.F_OK, (err) => {
//         if (!err) {
//           fs.unlink(oldImagePath, (err) => {
//             if (err) {
//               console.error("Failed to delete old image:", err);
//             } else {
//               console.log("Old image deleted:", oldImageFileName);
//             }
//           });
//         }
//       });
//     }

//     res.status(200).json({
//       statusText: "SUCCESS",
//       message: "Upload and update successful",
//       imageUrl,
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     res.status(500).json({ message: "Server error during upload" });
//   }
// });

// POST route to handle image upload and update user.car.image_url
router.post("/uploadImage", upload.single("image"), async (req, res) => {
  try {
    const oldImageFileName = req.body.oldImage;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const imageUrl = `${req.protocol}://localhost:${process.env.PORT}/uploads/${req.file.filename}`;

    /* delete old image as new is already set */
    if (oldImageFileName && oldImageFileName !== "logo.png") {
      const oldImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        oldImageFileName
      );
      fs.access(oldImagePath, fs.constants.F_OK, (err) => {
        if (!err) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error("Failed to delete old image:", err);
            } else {
              console.log("Old image deleted:", oldImageFileName);
            }
          });
        }
      });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Upload and update successful",
      imageUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

router.post("/updateUser", async (req, res) => {
  try {
    const { email, imageUrl } = req.body;

    if (!email || !imageUrl) {
      return res.status(400).json({ message: "Image and email are required" });
    }

    // Update user's car.image_url
    const updatedUser = await User.findOneAndUpdate(
      { "credentials.email": email },
      { "car.image_url": imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Upload and update successful",
      imageUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

router.post("/updateTrip", async (req, res) => {
  try {
    const tripId = req.body.trip_id;
    if (!tripId) {
      return res.status(400).json({ message: "trip id is required" });
    }

    //const imageUrl = `${req.protocol}://${req.get("host")}/uploads/$
    const imageUrl = `${req.protocol}://localhost:${process.env.PORT}/uploads/${req.file.filename}`;

    // Update user's car.image_url
    const updatedTrip = await User.findOneAndUpdate(
      { _id: tripId },
      { vehicle_image: imageUrl },
      { new: true }
    );

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Upload and update successful",
      imageUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
});

/* deleting car image */
router.post("/delete/carImage", async (req, res) => {
  const { email, image } = req.body;

  if (!email || !image) {
    return res.status(400).json({
      statusText: "FAILED",
      message: "Missing email or image filename.",
    });
  }

  try {
    const imagePath = path.join(__dirname, "..", "uploads", image);

    /* check if image file exists */
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete old image:", err);
          } else {
            console.log("Image deleted:", image);
          }
        });
      }
    });

    /* update user */
    const imageUrl = `${req.protocol}://localhost:${process.env.PORT}/uploads/${process.env.NOIMAGE}`;

    const updatedUser = await User.findOneAndUpdate(
      { "credentials.email": email },
      { "car.image_url": imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      statusText: "SUCCESS",
      message: "Image deleted successfully.",
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({
        statusText: "FAILED",
        message: "Image not found on server.",
      });
    }

    console.error("Error deleting image:", err);
    return res.status(500).json({
      statusText: "FAILED",
      message: "Server error while deleting image.",
    });
  }
});

router.post("/deleteImage", async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({
      statusText: "FAILED",
      message: "Missing image filename.",
    });
  }

  try {
    const imagePath = path.join(__dirname, "..", "uploads", image);

    /* check if image file exists */
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (!err) {
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error("Failed to delete old image:", err);
          } else {
            console.log("Image deleted:", image);
          }
        });
      }
    });

    return res.json({
      statusText: "SUCCESS",
      message: "Image deleted successfully.",
    });
  } catch (err) {
    if (err.code === "ENOENT") {
      return res.status(404).json({
        statusText: "FAILED",
        message: "Image not found on server.",
      });
    }

    console.error("Error deleting image:", err);
    return res.status(500).json({
      statusText: "FAILED",
      message: "Server error while deleting image.",
    });
  }
});

module.exports = router;
