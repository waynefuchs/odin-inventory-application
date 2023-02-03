require("dotenv").config();
const mongoose = require("mongoose");

module.exports = () => {
  mongoose.set("strictQuery", false);

  mongoose
    .connect(process.env.MONGODB_URI, {
      // dbName: process.env.DB_NAME,
      // user: process.env.DB_USER,
      // pass: process.env.DB_PASS,
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      serverSelectionTimeoutMS: 500, // This is the connection timeout setting
    })
    .then(() => {
      console.log("Mongodb connected....");
    })
    .catch((err) => {
      console.log(`mongoose.connect error: ${err.message}`);
    });

  // mongoose.connection.on("connected", () => {
  //   console.log("Mongoose connected to db...");
  // });

  mongoose.connection.on("reconnected", () => {
    console.log("Mongoose connection reconnected...");
  });

  mongoose.connection.on("error", (err) => {
    console.error(`mongoose.connection.on: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose connection is disconnected...");
  });

  process.on("SIGINT", () => {
    mongoose.connection.close(() => {
      console.log(
        "Mongoose connection is disconnected due to app termination..."
      );
      process.exit(0);
    });
  });
};
