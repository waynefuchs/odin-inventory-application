const async = require("async");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category.model");
const Item = require("../models/item.model");

function validateItem() {
  return [
    body("name")
      .trim()
      .isLength({ min: 1, max: 60 })
      .withMessage("Item name is required"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 60 })
      .withMessage("Description is required"),
    body("category")
      .trim()
      .isLength({ min: 1, max: 60 })
      .withMessage("Category is required"),
    body("price")
      .trim()
      .isLength({ min: 1, max: 10 })
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
        // Require an image to be uploaded with the item
        imageRequired: true,
        errors: null,
      });
    }
  );
};

exports.post_itemNew = [
  ...validateItem(),
  (req, res, next) => {
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

    if (!errors.isEmpty() || !req.file) {
      // Errors in the form data were found
      // Re-render the form
      // (!req.file): For a new item, a file must be uploaded
      async.parallel(
        {
          categories(callback) {
            Category.find({}, callback).sort({ name: "asc" });
          },
        },

        (err, results) => {
          const errorArray = [
            ...errors.array(),
            ...(!req.file
              ? [
                  {
                    msg: "An image file must be supplied for all new inventory items",
                  },
                ]
              : []),
          ];
          console.dir(errorArray);

          console.log("What");
          // reload form and show the first error
          if (err) return next(err);
          res.render("itemForm", {
            title: "New Item",
            item: itemData,
            categories: results.categories,
            buttonText: "Add Item",
            imageRequired: true,
            errors: errorArray,
          });
        }
      );
      return;
    }

    // Form data is valid
    const item = new Item(itemData);
    item.save((err) => {
      if (err) return next(err);
      req.item = item;
      return next();
    });
  },
];

exports.rename_uploaded_file = (req, res, next) => {
  const fs = require("fs");
  if (!req.file) {
    // No file uploaded
    return next();
    throw new Error("Failed to rename item, no file uploaded");
  }
  if (!req.item) {
    // No item was created (I don't have an item._id to name the file with)
    // But I do have a file... Clean up the file
    fs.rmSync(req.file.path);
    delete req.file;
    return next();
    throw new Error("Failed to rename item, no item found");
  }

  // Rename the file that 'multer' randomly named
  console.dir(req.file);
  console.log(`req.file.path: ${req.file.path}`);
  console.log(`req.file.destination: ${req.file.destination}`);
  console.log(`req.item._id: ${req.item._id}`);

  fs.rename(
    req.file.path,
    `${req.file.destination}${req.item._id}.png`,
    (err) => {
      if (err) return next(err);
      return next();
    }
  );
};

exports.redirect_to_item = (req, res, next) => {
  if (!req.item) throw new Error("Failed to redirect");
  res.redirect(req.item.url);
  return;
};

exports.redir = (req, res, next) => {
  if (!req.item || !req.item.url) throw new Error("Failed to redirect to item");
  res.redirect(req.item.url);
};

exports.get_items = (req, res, next) => {
  async.parallel(
    {
      items(callback) {
        Item.find({}, callback).sort({ name: "asc" });
      },
    },
    (err, results) => {
      console.dir(results.items);
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
      if (err) return next(err);
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
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.itemId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      const filename = results.item ? `public${results.item.image}` : null;
      console.log(filename);

      Item.findByIdAndDelete(req.params.itemId, (err) => {
        if (err) return next(err);
        if (filename) {
          const fs = require("fs");
          fs.rmSync(filename, {}, (err) => {
            if (err) return next(err);
          });
        }
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
        // Do not require the image when editing
        imageRequired: false,
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
            imageRequired: false,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Update and redirect
    Item.findByIdAndUpdate(req.params.itemId, itemData, {}, (err, item) => {
      if (err) return next(err);
      req.item = item;
      return next();
    });
  },
];
