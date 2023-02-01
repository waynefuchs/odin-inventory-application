const express = require("express");
const router = express.Router();

const itemController = require("../controllers/item.controller");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Grantiques" });
// });

router.get("/", itemController.get_index);

router.get("/items/new", itemController.get_newItemForm);
router.post("/items/new", itemController.post_newItemForm);
router.get("/items", itemController.get_items);
router.get("/items/:itemId", itemController.get_item);
router.get("/items/:itemId/delete", itemController.get_deleteItem);
router.post("/items/:itemId/delete", itemController.post_deleteItem);

module.exports = router;
