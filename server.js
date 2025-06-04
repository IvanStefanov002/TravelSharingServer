require("dotenv").config(); /* Load all the environment variables from our config file .evn */

const mongoose = require("mongoose"); /* pull in the mongoose library used to connect to MongoDB */
const express = require("express"); /* pull in the express library */

const app =
  express(); /* create an app variable which we can use to configure our server */
const port = process.env.PORT || 5000;

mongoose.connect(process.env.DATABASE_URL);

const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to Database.."));

/* set our server to accept json */
app.use(express.json());

/* set our routes i.e. which collections you'll use */

/* payments */
// const paymentsRouter = require("./routes/payments");
// app.use("/payments", paymentsRouter);

/* trips */
const tripsRouter = require("./routes/trips");
app.use("/trips", tripsRouter);

/* users */
const usersRouter = require("./routes/users");
app.use("/users", usersRouter);

/* vehicles */
// const vehiclesRouter = require("./routes/vehicles");
// app.use("/vehicles", vehiclesRouter);

/* for image uploads */
const uploadsRouter = require("./routes/uploads");
app.use("/upload", uploadsRouter);

/* Serve static files from 'uploads' folder */
app.use("/uploads", express.static("uploads"));
/* end for image uploads */

/* for stats */
const statsRoutes = require("./routes/stats");
app.use("/stats", statsRoutes);

app.listen(port, () => console.log("Server has started.."));
