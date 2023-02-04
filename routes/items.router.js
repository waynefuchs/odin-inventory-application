const express = require("express");
const router = express.Router();

const cItem = require("../controllers/item.controller");

// Handle File Uploads
const multer = require("multer");
const upload = multer({ dest: "public/items/" });

// Items
router.get("/", cItem.get_items);

router.get("/new", cItem.get_itemNew);
router.post(
  "/new",
  upload.single("image"),
  cItem.post_itemNew,
  cItem.rename_uploaded_file,
  cItem.redirect_to_item
);

router.get("/:itemId", cItem.get_item);

router.get("/:itemId/edit", cItem.get_itemEdit);
router.post(
  "/:itemId/edit",
  upload.single("image"),
  cItem.post_itemEdit,
  cItem.rename_uploaded_file,
  cItem.redirect_to_item
);

router.get("/:itemId/delete", cItem.get_itemDelete);
router.post("/:itemId/delete", cItem.post_itemDelete);

module.exports = router;
