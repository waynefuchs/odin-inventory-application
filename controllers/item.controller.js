const async = require("async");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category.model");
const Item = require("../models/item.model");

exports.get_index = (req, res, next) => {
  async.parallel(
    // Get: {categoryCount, itemCount, itemInStockCount}
    {
      categoryCount(callback) {
        Category.countDocuments({}, callback);
      },
      itemCount(callback) {
        Item.countDocuments({}, callback);
      },
      itemInStockCount(callback) {
        Item.countDocuments({ available: { $gt: 0 } }, callback);
      },
    },

    // Pass the results to the view engine
    (err, results) => {
      if (err) return next(err);
      res.render("index", {
        title: "Grantiques",
        error: err,
        data: results,
      });
    }
  );
};

exports.get_newItemForm = (req, res, next) => {
  // Find Category list for drop down (select)
  async.parallel(
    {
      categories(callback) {
        Category.find({}, callback);
      },
    },

    // Render page
    (err, results) => {
      if (err) return next(err);
      res.render("newItem", {
        title: "New Item",
        categories: results.categories,
      });
    }
  );
};

const alphaErrorMessage = "Only A-Z, Space, and Dash characters are allowed";
exports.post_newItemForm = [
  // Generate an array with all the form data in it
  body("name")
    .trim()
    .isLength({ min: 1, max: 60 })
    .escape()
    .withMessage("Item name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage(`${alphaErrorMessage} in the item name`),
  body("description")
    .trim()
    .isLength({ min: 1, max: 60 })
    .escape()
    .withMessage("Description is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage(`${alphaErrorMessage} in the description`),
  body("category")
    .trim()
    .isLength({ min: 1, max: 60 })
    .escape()
    .withMessage("Category is required"),
  body("price")
    .trim()
    .isLength({ min: 1, max: 10 })
    .escape()
    .withMessage("Price is required")
    .isNumeric()
    .withMessage("Price must be a a dollar amount"),
  body("available").trim().isLength({ min: 1, max: 4 }),

  // And execute this function at the end
  (req, res, next) => {
    const errors = validationResult(req);

    // build an object with the form data
    const itemData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      available: req.body.available,
    };

    if (!errors.isEmpty()) {
      // Errors in the form data were found
      // Re-render the form
      async.parallel(
        {
          categories(callback) {
            Category.find({}, callback);
          },
        },

        (err, results) => {
          // reload form and show the first error
          if (err) return next(err);
          res.render("newItem", {
            title: "New Item",
            item: itemData,
            categories: results.categories,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Form data is valid
    const item = new Item(itemData);
    item.save((err) => {
      if (err) return next(err);
      res.redirect(item.url);
    });
  },
];

exports.get_items = (req, res, next) => {
  async.parallel(
    {
      items(callback) {
        Item.find({}, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("items", {
        title: "Items",
        items: results.items,
        errors: err,
      });
    }
  );
};

exports.get_item = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        // if (!req.params.itemId) return next();
        Item.findById(req.params.itemId, callback);
      },
    },
    (err, results) => {
      if (err) {
        console.dir(item);
        return next(err);
      }
      res.render("item", {
        title: `Item`,
        item: results.item,
        errors: err,
      });
    }
  );
};

exports.get_deleteItem = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        // if (!req.params.itemId) return next();
        Item.findById(req.params.itemId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("deleteItem", {
        title: `Item`,
        item: results.item,
        errors: err,
      });
    }
  );
};

exports.post_deleteItem = (req, res, next) => {
  console.log(req.params.itemId);
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.itemId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      Item.findByIdAndDelete(req.params.itemId, (err) => {
        if (err) return next(err);
        res.redirect("/items");
      });
    }
  );
};
