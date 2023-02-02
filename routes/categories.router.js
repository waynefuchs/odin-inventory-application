const express = require("express");
const router = express.Router();

const cCategory = require("../controllers/category.controller");

// Categories
router.get("/", cCategory.get_categories);
router.get("/new", cCategory.get_categoryNew);
router.post("/new", cCategory.post_categoryNew);
router.get("/:categoryId", cCategory.get_category);
router.get("/:categoryId/edit", cCategory.get_categoryEdit);
router.post("/:categoryId/edit", cCategory.post_categoryEdit);
router.get("/:categoryId/delete", cCategory.get_categoryDelete);
router.post("/:categoryId/delete", cCategory.post_categoryDelete);

module.exports = router;
