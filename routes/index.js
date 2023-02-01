const express = require("express");
const router = express.Router();

const cIndex = require("../controllers/index.controller");
const cItem = require("../controllers/item.controller");
const cCategory = require("../controllers/category.controller");

router.get("/", cIndex.get_index);

// Items
router.get("/items", cItem.get_items);
router.get("/items/new", cItem.get_itemNewForm);
router.post("/items/new", cItem.post_itemNewForm);
router.get("/items/:itemId", cItem.get_item);
router.get("/items/:itemId/delete", cItem.get_itemDelete);
router.post("/items/:itemId/delete", cItem.post_itemDelete);

// Categories
router.get("/categories", cCategory.get_categories);
router.get("/categories/new", cCategory.get_categoryNewForm);
router.post("/categories/new", cCategory.post_categoryNewForm);
router.get("/categories/:categoryId", cCategory.get_category);
router.get("/categories/:categoryId/delete", cCategory.get_categoryDelete);
router.post("/categories/:categoryId/delete", cCategory.post_categoryDelete);

module.exports = router;
