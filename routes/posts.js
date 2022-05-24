const express = require("express");
const router = express.Router();
const { addPost } = require("../controllers/posts");

router.route("/").get(addPost);

module.exports = router;
