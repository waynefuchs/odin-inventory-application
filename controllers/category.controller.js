const async = require("async");
const { body, validationResult } = require("express-validator");

const Category = require("../models/category.model");
const Item = require("../models/item.model");

function validateCategory() {
  return [
    body("name")
      .trim()
      .isLength({ min: 1, max: 60 })
      .withMessage("Category Name is required"),
    body("description")
      .trim()
      .isLength({ min: 1, max: 60 })
      .withMessage("Category Description is required"),
  ];
}

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

exports.get_categoryEdit = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.categoryId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("categoryForm", {
        title: "Edit Category",
        category: results.category,
        buttonText: "Update Category",
        errors: null,
      });
    }
  );
};

exports.post_categoryEdit = [
  ...validateCategory(),
  (req, res, next) => {
    const errors = validationResult(req);
    const categoryData = {
      name: req.body.name,
      description: req.body.description,
    };

    // Check for validation errors
    if (!errors.isEmpty()) {
      res.render("categoryForm", {
        title: "Edit Category",
        category: categoryData,
        buttonText: "Update Category",
        errors: errors.array(),
      });
      return;
    }

    // Data is valid, update
    Category.findByIdAndUpdate(
      // id
      req.params.categoryId,
      // data
      categoryData,
      // options
      {},
      // callback
      (err, category) => {
        if (err) return next(err);
        res.redirect(category.url);
      }
    );
  },
];

exports.get_categoryNew = (req, res, next) => {
  res.render("categoryForm", {
    title: "New Category",
    category: {
      name: "",
      description: "",
    },
    buttonText: "Add Category",
    errors: null,
  });
};

exports.post_categoryNew = [
  ...validateCategory(),
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
      res.render("categoryForm", {
        title: "New Category",
        category: categoryData,
        buttonText: "Add Category",
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
