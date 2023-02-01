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
