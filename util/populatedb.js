#! /usr/bin/env node

// Do not run this script on PROD
// (This is a demo project anyway...)
// This script deletes all uploaded image files
// This script populates demo data into mongodb

require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");

const async = require("async");
const Item = require("../models/item.model");
const Category = require("../models/category.model");

// Throw an error if no url supplied
const mongoDB = process.env.MONGODB_URI;
if (!mongoDB) {
  console.log(
    "Missing Required `MONGODB_URI`:\n" +
      "`mongodb://[<user>:<password>@]<server-address>:<port>/<database-name>`"
  );
  throw new Error("MONGODB_URI not found in project `.env`");
}

// Print out a message of what this script is about to do
console.log(`
WARNING: This script deletes the following directory:
  ../public/items
This script populates '${mongoDB}'
  * items
  * categories
`);

// Remove the "uploaded" files
// (by removing the directory)
const fs = require("fs");
fs.rmSync("../public/items/", { force: true, recursive: true }, (err) => {
  if (err) throw new Error("Failed to delete the lego directory");
});

// Add the directory back
fs.mkdir("../public/items/", {}, (err) => {
  if (err) throw err;
});

// Connect to the db
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Before doing anything else, wipe the database
function wipeData(cb) {
  async.parallel(
    [
      function removeCategories(callback) {
        Category.remove({}, callback);
      },
      function removeItems(callback) {
        Item.remove({}, callback);
      },
    ],
    cb
  );
}

const categories = [];
const items = [];

function categoryCreate(name, description, cb) {
  const categoryDetail = { name, description };
  const category = new Category(categoryDetail);
  category.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(
      `New Category: ${categoryDetail.name}: ${categoryDetail.description}`
    );
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, category, price, available, cb) {
  const itemDetail = { name, description, category, price, available };
  const item = new Item(itemDetail);
  item.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log(`New Item: ${itemDetail.name}`);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
  async.series(
    [
      function (callback) {
        categoryCreate(
          "City",
          "Realistic vehicles, buildings, and fun characters.",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Classic",
          "Basic blocks and a great place to start",
          callback
        );
      },
      function (callback) {
        categoryCreate("Duplo", "LEGO for your baby", callback);
      },
      function (callback) {
        categoryCreate(
          "Friends",
          "Sets for kids to tell stories, work on interpersonal skills, and celebrate friendship",
          callback
        );
      },
      function (callback) {
        categoryCreate("Star Wars", "Feel the force.", callback);
      },
    ],
    cb
  );
}

// function (callback) {
//   itemCreate(
//     "",
//     "",
//     "",
//     ,
//     ,
//     callback
//   );
// },

const filenames = {
  Bunny: "bunny.png",
  Lizard: "lizard.png",
  Princess: "princess.png",
  Sword: "sword.png",
  Automobile: "car.png",
  Monkey: "monkey.png",
  "Santa Claus": "santa.png",
  Lifeguard: "tennis-lifeguard.png",
  Crab: "crab.png",
  Ninja: "ninja.png",
  Spaceship: "spaceship.png",
  Dinosaur: "velociraptor.png",
  "Fire Kitty": "firekitty.png",
  Pony: "pony.png",
  Spider: "spider.png",
  Zombie: "zombie.png",
};

function createItems(next) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Bunny",
          "It's a bunny, Julia",
          "Friends",
          1.99,
          3,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Automobile",
          "It's a car. Vroom vroom.",
          "Friends",
          34.99,
          1,
          callback
        );
      },
    ],
    next
  );
}

async.series(
  [wipeData, createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      const sourcePath = "lego/";
      const destPath = "../public/items/";
      for (const i of items) {
        fs.copyFile(
          `${sourcePath}${filenames[i.name]}`,
          `${destPath}${i._id}.png`,
          (err) => {
            if (err) throw err;
            console.log("Item: " + i);
          }
        );
      }
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
