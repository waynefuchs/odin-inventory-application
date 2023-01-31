const express = require("express");
const router = express.Router();

const itemController = require("../controllers/item.controller");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Grantiques" });
// });

router.get("/", itemController.get_index);

router.get("/item/new", itemController.get_newItemForm);
router.post("/item/new", itemController.post_newItemForm);
router.get("/item", itemController.get_items);
router.get("/item/:itemId", itemController.get_item);

module.exports = router;
