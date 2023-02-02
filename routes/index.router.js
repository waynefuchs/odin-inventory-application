const express = require("express");
const router = express.Router();

const cIndex = require("../controllers/index.controller");

router.get("/", cIndex.get_index);

module.exports = router;
