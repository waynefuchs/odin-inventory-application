const express = require("express");
const router = express.Router();

const cItem = require("../controllers/item.controller");

// File Uploads
// const multer = require("multer");
// const upload = multer({ dest: "uploads/" });

// Items
router.get("/", cItem.get_items);
router.get("/new", cItem.get_itemNew);
// router.post("/new", upload.single("image"), cItem.post_itemNew);
router.post("/new", cItem.post_itemNew);
router.get("/:itemId", cItem.get_item);
router.get("/:itemId/edit", cItem.get_itemEdit);
router.post("/:itemId/edit", cItem.post_itemEdit);
router.get("/:itemId/delete", cItem.get_itemDelete);
router.post("/:itemId/delete", cItem.post_itemDelete);

module.exports = router;
