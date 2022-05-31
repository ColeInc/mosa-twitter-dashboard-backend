import express from "express";
import { getPosts, addPost } from "../controllers/posts";
import validatePayloadMiddleware from "../middleware/validate-payload";
import postSchema from "../schemas/post.schema";

const router = express.Router();

router.get("/", getPosts);
router.post("/", validatePayloadMiddleware(postSchema), addPost);

export default router;
