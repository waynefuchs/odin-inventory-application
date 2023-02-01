const async = require("async");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category.model");
const Item = require("../models/item.model");

exports.get_categories = (req, res, next) => {
  async.parallel(
    {
      categories(callback) {
        Category.find({}, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("categories", {
        title: "Categories",
        categories: results.categories,
        errors: err,
      });
    }
  );
};

exports.get_category = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.categoryId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("category", {
        title: "Category",
        category: results.category,
        errors: err,
      });
    }
  );
};

exports.get_categoryDelete = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.categoryId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("categoryDelete", {
        title: "Delete Category",
        category: results.category,
        errors: err,
      });
    }
  );
};

exports.get_categoryNewForm = (req, res, next) => {
  res.render("categoryNewForm", {
    title: "New Category",
  });
};

const alphaErrorMessage = "Only A-Z, Space, and Dash characters are allowed";
exports.post_categoryNewForm = [
  // Generate an array with all the form data in it
  body("name")
    .trim()
    .isLength({ min: 1, max: 60 })
    .escape()
    .withMessage("Item name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage(`${alphaErrorMessage} in the category name`),
  // Generate an array with all the form data in it
  body("description")
    .trim()
    .isLength({ min: 1, max: 60 })
    .escape()
    .withMessage("Item name is required")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage(`${alphaErrorMessage} in the category description`),

  // And execute this function at the end of validation
  (req, res, next) => {
    // Run form validation
    const errors = validationResult(req);

    // build data object with form data
    const categoryData = {
      name: req.body.name,
      description: req.body.description,
    };

    // Check for form validation errors
    if (!errors.isEmpty()) {
      res.render("categoryNewForm", {
        title: "New Category",
        category: categoryData,
        errors: errors.array(),
      });
      return next();
    }

    // Form data is valid
    const category = new Category(categoryData);
    category.save((err) => {
      if (err) return next(err);
      res.redirect(category.url);
    });
  },
];

exports.post_categoryDelete = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.categoryId, callback);
      },
    },

    (err, results) => {
      // If looking for the id failed, return for more middleware processing
      if (err) return next(err);
      const category = results.category;

      async.parallel(
        {
          items(callback) {
            Item.find({ category: category.name }, callback);
          },
        },
        (err, results) => {
          if (err) return next(err);
          const items = results.items;

          // Can not delete categories that have items
          if (items.length > 0) {
            res.render("category", {
              title: "Category",
              message:
                "Can not delete a category that items are currently assigned to!",
              category: category,
            });
            return next();
          }

          // The category was found,
          // No items are using this category...
          ///...so perform the delete
          Category.findByIdAndDelete(req.params.categoryId, (err) => {
            if (err) return next(err);
            res.redirect("/categories");
          });
        }
      );
    }
  );
};
