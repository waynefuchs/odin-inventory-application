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

exports.get_deleteCategory = (req, res, next) => {
  async.parallel(
    {
      category(callback) {
        Category.findById(req.params.categoryId, callback);
      },
    },
    (err, results) => {
      if (err) return next(err);
      res.render("deleteCategory", {
        title: "Delete Category",
        category: results.category,
        errors: err,
      });
    }
  );
};
