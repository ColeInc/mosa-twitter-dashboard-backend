const express = require("express");
const router = express.Router();
const { addPost } = require("../controllers/posts");

router.get("/", addPost);

module.exports = router;
