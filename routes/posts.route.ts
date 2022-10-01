import express from "express";
import { getPosts, createPost, updatePost, deletePost } from "../controllers/posts.controller";
import validatePayloadMiddleware from "../middleware/validate-payload";
import postSchema from "../schemas/post.schema";

const router = express.Router();

router.get("/", getPosts);
router.post("/", validatePayloadMiddleware(postSchema), createPost);
// router.post("/", createPost);
router.patch("/:postId", validatePayloadMiddleware(postSchema), updatePost);
router.delete("/:postId", validatePayloadMiddleware(postSchema), deletePost);

export default router;
