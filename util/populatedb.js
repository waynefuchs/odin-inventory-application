#! /usr/bin/env node

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
This script populates '${mongoDB}'
  * items
  * categories
`);

// Connect to the db
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

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
          "Technology",
          "Computers, Electronics, Gadgets...",
          callback
        );
      },
      function (callback) {
        categoryCreate("Antiques", "Old stuff.", callback);
      },
      function (callback) {
        categoryCreate("Books", "Anything with a page you can turn", callback);
      },
    ],
    cb
  );
}

function createItems(next) {
  async.parallel(
    [
      function (callback) {
        itemCreate(
          "Camel",
          "A hand carved wooden camel from Egypt circa 1950",
          "Technology",
          5999,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Maine Lighthouse",
          "A brass lighthouse",
          "Technology",
          6099,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Common Loon",
          "A hand carved wooden loon, expertly painted",
          "Technology",
          9999,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Old Man",
          "Hand carved figure",
          "Technology",
          6499,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Sailor's Wife",
          "Hand carved fiture",
          "Technology",
          6499,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Moose Paperweight",
          "A paperweight to remind you to check for moose",
          "Technology",
          3499,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Oriental Cup",
          "A 24k gold-coated glass cup",
          "Technology",
          2299,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Silver Teacup",
          "A teacup circa 19th century",
          "Technology",
          12499,
          1,
          callback
        );
      },
      function (callback) {
        itemCreate(
          "Train Plate",
          "Its a plate. With a train on it.",
          "Technology",
          9499,
          1,
          callback
        );
      },
    ],
    next
  );
}

async.series(
  [createCategories, createItems],
  // Optional callback
  function (err, results) {
    if (err) {
      console.log("FINAL ERR: " + err);
    } else {
      console.log("Items: " + items);
    }
    // All done, disconnect from database
    mongoose.connection.close();
  }
);
