const express = require("express");
const router = express.Router();

const itemController = require("../controllers/item.controller");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Grantiques" });
// });

router.get("/", itemController.GETindex);

router.get("/item/new", itemController.GETnewItemForm);
router.post("/item/new", itemController.POSTnewItemForm);
router.get("/item", itemController.GETitem);

module.exports = router;
