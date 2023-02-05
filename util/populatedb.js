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
        categoryCreate(
          "Creator 3-in-1",
          "Vehicles, animals, and play sets",
          callback
        );
      },
      function (callback) {
        categoryCreate("Duplo", "LEGO for your baby", callback);
      },
      function (callback) {
        categoryCreate("NINJAGO", "The thrilling world of Ninjas", callback);
      },
      function (callback) {
        categoryCreate(
          "Friends",
          "Sets for kids to tell stories, work on interpersonal skills, and celebrate friendship",
          callback
        );
      },
      function (callback) {
        categoryCreate(
          "Holiday",
          "Special Christmas, Valentines, Easter, Thanksgiving, and Halloween sets",
          callback
        );
      },
      function (callback) {
        categoryCreate("Jurassic World", "Dinosaur Adventures", callback);
      },
      function (callback) {
        categoryCreate(
          "Minecraft",
          "For when you want to play video games, but you don't have a computer",
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

      function (callback) {
        itemCreate("Lizard", "A chameleon", "Friends", 0.95, 3, callback);
      },
      function (callback) {
        itemCreate(
          "Princess",
          "A very rare princess",
          "Friends",
          19.99,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Sword",
          "Careful, the pointy end is sharp",
          "Creator 3-in-1",
          0.49,
          47,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Monkey",
          "A little monkey, jumping on the bed",
          "Creator 3-in-1",
          0.99,
          10,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Santa Claus",
          "Figure represents the real Santa on December 24",
          "Holiday",
          1,
          5.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Lifeguard",
          "This one, unfortunately, cannot save you",
          "Friends",
          5,
          8.15,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Crab",
          "Where are it's eyes? Shhh...",
          "Classic",
          5,
          8.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Ninja",
          "It's hard to see in the dark, mistakes were made",
          "NINJAGO",
          3,
          1.23,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Spaceship",
          "A mini.. Centennial? No. Millennial? Not quite.. Millennium.. Yes. Eagle. No. Hawk. No. Millennium Falcon. Yeah, that's the one.",
          "Star Wars",
          1,
          649.99,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Dinosaur",
          "It's a bird, not a lizard",
          "Jurassic World",
          1003,
          0.25,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Fire Kitty",
          "Is it a dragon? Is it a cat!? Why not both!!!",
          "Classic",
          3,
          5.99,
          callback
        );
      },
      function (callback) {
        itemCreate("Pony", "It's pretty short", "Friends", 4, 14.34, callback);
      },
      function (callback) {
        itemCreate(
          "Spider",
          "For some reason we made this",
          "Friends",
          9001,
          0.01,
          callback
        );
      },
      function (callback) {
        itemCreate("Zombie", "So scary", "Minecraft", 1, 19.42, callback);
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
