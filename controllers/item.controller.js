const async = require("async");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category.model");
const Item = require("../models/item.model");

function validateItem() {
  return [
    body("name")
      .trim()
      .isLength({ min: 1, max: 60 })
      .escape()
      .withMessage("Item name is required"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 60 })
      .escape()
      .withMessage("Description is required"),
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
  ];
}

exports.get_itemNew = (req, res, next) => {
  // Find Category list for drop down (select)
  async.parallel(
    {
      categories(callback) {
        Category.find({}, callback).sort({ name: "asc" });
      },
    },
    (err, results) => {
      if (err) return next(err);
      const itemData = {
        name: "",
        description: "",
        category: "",
        price: "",
        available: "",
      };
      res.render("itemForm", {
        title: "New Item",
        item: itemData,
        categories: results.categories,
        buttonText: "Add Item",
        errors: null,
      });
    }
  );
};

exports.post_itemNew = [
  ...validateItem(),
  (req, res, next) => {
    res.send("FIXING");

    const multer = require("multer");
    const upload = multer({ dest: "uploads/", filename: "abcd" });
    upload.single("image");

    console.dir(req.file);
    req.file.filename = "abd";
    return;

    // Run form validation
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
            Category.find({}, callback).sort({ name: "asc" });
          },
        },

        (err, results) => {
          // reload form and show the first error
          if (err) return next(err);
          res.render("itemForm", {
            title: "New Item",
            item: itemData,
            categories: results.categories,
            buttonText: "Add Item",
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
        Item.find({}, callback).sort({ name: "asc" });
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

exports.get_itemDelete = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        // if (!req.params.itemId) return next();
        Item.findById(req.params.itemId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("itemDelete", {
        title: `Item`,
        item: results.item,
        errors: err,
      });
    }
  );
};

exports.post_itemDelete = (req, res, next) => {
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

exports.get_itemEdit = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.itemId, callback);
      },
      categories(callback) {
        Category.find({}, callback).sort({ name: "asc" });
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("itemForm", {
        title: "Update Item",
        item: results.item,
        categories: results.categories,
        buttonText: "Update Item",
        errors: null,
      });
    }
  );
};

exports.post_itemEdit = [
  ...validateItem(),
  (req, res, next) => {
    const errors = validationResult(req);
    const itemData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      available: req.body.available,
    };

    // Check for error
    if (!errors.isEmpty()) {
      async.parallel(
        {
          categories(callback) {
            Category.find({}, callback).sort({ name: "asc" });
          },
        },
        (err, results) => {
          if (err) return next(err);
          res.render("itemForm", {
            title: "Update Item",
            item: itemData,
            categories: results.categories,
            buttonText: "Update Item",
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Update and redirect
    Item.findByIdAndUpdate(req.params.itemId, itemData, {}, (err, item) => {
      if (err) return next(err);
      res.redirect(item.url);
    });
  },
];
