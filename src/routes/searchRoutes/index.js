const express = require("express");
const mongoose = require("mongoose");
const { search } = require("./controllers");
const router = express.Router();

router.post("/search", search);

module.exports = router;
