import express from "express";
import { addPost } from "../controllers/posts";

const router = express.Router();

router.route("/").get(addPost);

export default router;
