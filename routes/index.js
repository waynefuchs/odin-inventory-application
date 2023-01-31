const express = require("express");
const router = express.Router();

const itemController = require("../controllers/item.controller");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Grantiques" });
// });

router.get("/", itemController.index);

module.exports = router;
