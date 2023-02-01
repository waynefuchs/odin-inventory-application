const express = require("express");
const router = express.Router();

const cItem = require("../controllers/item.controller");
const cCategory = require("../controllers/category.controller");

router.get("/", cItem.get_index);

// Items
router.get("/items", cItem.get_items);
router.get("/items/new", cItem.get_newItemForm);
router.post("/items/new", cItem.post_newItemForm);
router.get("/items/:itemId", cItem.get_item);
router.get("/items/:itemId/delete", cItem.get_deleteItem);
router.post("/items/:itemId/delete", cItem.post_deleteItem);

// Categories
router.get("/categories", cCategory.get_categories);
router.get("/categories/:categoryId", cCategory.get_category);
router.get("/categories/:categoryId/delete", cCategory.get_deleteCategory);

module.exports = router;
