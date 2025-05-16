const express = require("express");
const crypto = require("crypto");

const router = express.Router();

/* MongoDB user model */
const User = require("../models/user");

/* MongoDB user verification model */
const UserVerification = require("../models/UserVerification");

/* email handler */
const nodemailer = require("nodemailer");

/* unique string */
const { v4: uuidv4 } = require("uuid");

/* env variables */
require("dotenv").config();

/* password handler */
const bcrypt = require("bcrypt");

/* path for static verfication page */
const path = require("path");

/* nodemailer stuff */
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

/* testing success */
transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Transporter is ready..");
  }
});

/* get all users */
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* get user by email and password */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      "credentials.email": email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.credentials.password);

    if (isMatch) {
      return res.json({
        statusCode: 200,
        statusText: "SUCCESS",
        message: "Signin successful",
        data: [
          {
            id: user._id,
            profileImage: user.profile_image,
            name: user.name,
            email: user.credentials.email,
            rating: user.ratings.average,
            ratingsCount: user.ratings.count,
            tripsCount: user.trips_count,
            roles: user.roles,
          },
        ],
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* get user by id */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    /* Convert to plain object and exclude password */
    const userObj = user.toObject();
    delete userObj.credentials?.password; // Safely remove nested password

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* get user's car info by user id */
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("car");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     res.json({
//       car: user.car,
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

/* update user roles */
router.post("/updateRoles", async (req, res) => {
  try {
    const { email, roles } = req.body;

    // Update user's car.image_url
    const updatedUser = await User.findOneAndUpdate(
      { "credentials.email": email },
      { roles: roles },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Update successful",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error saving roles" });
  }
});

/* change email of user */
router.post("/changeEmail", async (req, res) => {
  try {
    const { currentEmail, newEmail } = req.body;

    // Find user by email
    const user = await User.findOne({
      "credentials.email": newEmail.trim().toLowerCase(),
    });

    if (!user) {
      /* no dublicate user exists -> save new email */
      const updatedUser = await User.findOneAndUpdate(
        { "credentials.email": currentEmail },
        { "credentials.email": newEmail.trim().toLowerCase() },
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    res.status(200).json({
      statusText: "SUCCESS",
      message: "Update successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* change password of user */
router.post("/changePassword", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    // Find user by email
    const user = await User.findOne({
      "credentials.email": email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare provided old password with stored hashed password
    const isMatch = await bcrypt.compare(
      oldPassword,
      user.credentials.password
    );

    if (isMatch) {
      // Old password matches, proceed to hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the password in the database
      const updatedUser = await User.findOneAndUpdate(
        { "credentials.email": email },
        { "credentials.password": hashedPassword },
        { new: true }
      );

      res.status(200).json({
        statusText: "SUCCESS",
        message: "Password update successful",
      });
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* fetch vehicle info */
router.post("/fetchVehicleInfo", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ "credentials.email": email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      statusCode: 200,
      statusText: "SUCCESS",
      message: "Fetch vehicle info successful",
      data: [
        {
          car: user.car,
          /*age: user.age,*/
          /*role: user.role, */
          ratings: user.ratings,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// /* Creating a user with signup */
// router.post("/signup", async (req, res) => {
//   /* Password hashing with SHA-256 */
//   const hashedPassword = crypto
//     .createHash("sha256")
//     .update(req.body.password)
//     .digest("hex");

//   const user = new User({
//     name: req.body.name,
//     dateOfBirth: req.body.dateOfBirth,
//     credentials: {
//       email: req.body.email,
//       username: req.body.name,
//       password: req.body.password,
//       //password: hashedPassword,
//     },
//   });

//   try {
//     const newUser = await user.save();
//     //res.status(201).json(newUser);
//     res.json({
//       statusCode: 201,
//       statusText: "SUCCESS",
//       message: "Signup successful",
//       data: {
//         _id: newUser.id,
//         name: newUser.name,
//         email: newUser.credentials.email,
//         password: newUser.credentials.password,
//         dateOfBirth: newUser.dateOfBirth,
//       },
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// });

/* Creating a user */
router.post("/", async (req, res) => {
  /* Password hashing with SHA-256 */
  const hashedPassword = crypto
    .createHash("sha256")
    .update(req.body.password)
    .digest("hex");

  const user = new User({
    name: req.body.name,
    age: req.body.age,
    credentials: {
      email: req.body.email,
      username: req.body.username,
      password: hashedPassword,
    },
    car: req.body.car,
    ratings: req.body.ratings,
    driving_experience_in_years: req.body.driving_experience_in_years,
    roles: req.body.roles,
  });

  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* setting server url */
const getCurrentUrl = require("./../utils/getDynamicAdress");
const currentUrl = getCurrentUrl();

/* Signup */
router.post("/signup", (req, res) => {
  let { name, email, password, dateOfBirth } = req.body;
  name = name.trim();
  email = email.trim().toLowerCase();
  password = password.trim();
  dateOfBirth = dateOfBirth.trim();

  if (name == "" || email == "" || password == "" || dateOfBirth == "") {
    res.json({
      statusText: "FAILED",
      message: "Empty input fields!",
    });
  } else if (!/^[a-zA-Z]*$/.test(name)) {
    res.json({
      statusText: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      statusText: "FAILED",
      message: "Invalid email entered",
    });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.json({
      statusText: "FAILED",
      message: "Invalid date of birth entered",
    });
  } else if (password.length < 8) {
    res.json({
      statusText: "FAILED",
      message: "Password is too short!",
    });
  } else {
    /* checking if user already exists */
    User.find({ "credentials.email": email })
      .then((result) => {
        if (result.length) {
          /* A user already exists */
          res.json({
            statusText: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          /* try to create new user */

          const saltRounds = 10;
          bcrypt
            .hash(password, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                name: name,
                dateOfBirth: dateOfBirth,
                credentials: {
                  email: email,
                  username: name,
                  password: hashedPassword,
                  verified: false,
                  //password: hashedPassword,
                },
              });

              // const newUser = new User({
              //   name,
              //   email,
              //   password: hashedPassword,
              //   dateOfBirth,
              //   varified: false,
              // });

              //const newUser = await user.save();
              newUser
                .save()
                .then((result) => {
                  /* Handle account verification */
                  //sendVerificationEmail(result, res);
                  sendVerificationEmail(
                    { _id: result._id, email: result.credentials.email },
                    res
                  );
                })
                .catch((err) => {
                  console.log(err);
                  res.json({
                    statusText: "FAILED",
                    message: "An error occured while saving user account!",
                  });
                });
            })
            .catch((err) => {
              res.json({
                statusText: "FAILED",
                message: "An error occured while hashing password!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          statusText: "FAILED",
          message: "An error occured while checking for existing user!",
        });
      });
  }
});

/* send verification email */
const sendVerificationEmail = ({ _id, email }, res) => {
  const uniqueString = uuidv4() + _id;

  /* mail options */
  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Email",
    html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This Link
        <b>expires in 6 hours</b>.</p><p>Press <a href=${
          currentUrl + "users/verify/" + _id + "/" + uniqueString
        }>here</a> to preceed.</p>`,
  };

  /* hash the unique string */
  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      /* set values in userVerification collection */
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createdAt: Date.now(),
        expiresAt: Date.now() + 21600000,
      });
      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              /* email sent and verication record saved */
              res.json({
                statusText: "PENDING",
                message: "Verification email sent",
                data: {
                  userId: _id,
                  email,
                },
              });
            })
            .catch((err) => {
              res.json({
                statusText: "FAILED",
                message: "Verification email failed",
              });
              console.log(err);
            });
        })
        .catch((error) => {
          console.log(error);
          res.json({
            statusText: "FAILED",
            message: "Couldn't save verification email data",
          });
        });
    })
    .catch(() => {
      res.json({
        statusText: "FAILED",
        message: "An error occured while hashing email data!",
      });
    });
};

/* resend verification */
router.post("/resendVerificationLink", async (req, res) => {
  try {
    let { userId, email } = req.body;

    if (!userId || !email) {
      throw Error("Empty user details are not allowed");
    } else {
      /* delete existing records and resend */
      await UserVerification.deleteMany({ userId });
      sendVerificationEmail({ _id: userId, email }, res);
    }
  } catch (error) {
    res.json({
      statusText: "FAILED",
      message: `Verification Link Resend Error. ${error.message}`,
    });
  }
});

/* Verify email */
router.get("/verify/:userId/:uniqueString", (req, res) => {
  console.log("verify email start..");
  let { userId, uniqueString } = req.params;

  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        /* user verification record exists so we proceed */

        const { expiresAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;

        /* checking for expired unique string */
        if (expiresAt < Date.now()) {
          UserVerification.deleteOne({ userId })
            .then((result) => {
              /* delete expired user */
              User.deleteOne({ _id: userId })
                .then(() => {
                  let message = "Link has expired. Please sign up again.";
                  res.redirect(`/users/verified?error=true&message=${message}`);
                })
                .catch((error) => {
                  console.log(error);
                  let message =
                    "Clearing user with expired unique string failed.";
                  res.redirect(`/users/verified?error=true&message=${message}`);
                });
            })
            .catch((error) => {
              /* deletion failed */
            });
        } else {
          /* valid record exists so we validate the user string */
          /* first compare the hashed unique string */

          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                /* Strings match */

                User.updateOne(
                  { _id: userId },
                  { "credentials.verified": true }
                )
                  .then(() => {
                    UserVerification.deleteOne({ userId })
                      .then(() => {
                        res.sendFile(
                          path.join(__dirname, "./../views/verified.html")
                        );
                      })
                      .catch((error) => {
                        console.log(error);
                        let message =
                          "An error occured while finalizing successful verification.";
                        res.redirect(
                          `/users/verified?error=true&message=${message}`
                        );
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    let message =
                      "An error occured while updating user record to show verified.";
                    res.redirect(
                      `/users/verified?error=true&message=${message}`
                    );
                  });
              } else {
                /* Existing record but incorrect verification details passed. */
                let message =
                  "Invalid verification details passed. Check your inbox.";
                res.redirect(`/users/verified?error=true&message=${message}`);
              }
            })
            .catch((err) => {
              let message = "An error occurred while comparing unique strings.";
              res.redirect(`/users/verified?error=true&message=${message}`);
            });
        }
      } else {
        /* user verification record doesn't exists */
        let message =
          "Account record doesn't exist or has been verified already. Please sign up or log in.";
        res.redirect(`/users/verified?error=true&message=${message}`);
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occured while checking for existing user verification record";
      res.redirect(`/users/verified?error=true&message=${message}`);
    });
});

/* Verified page Route */
router.get("/verified", (_, res) => {
  res.sendFile(path.join(__dirname, "./../views/verified.html"));
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

module.exports = router;
