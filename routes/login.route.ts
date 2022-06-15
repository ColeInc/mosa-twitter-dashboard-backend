import express from "express";
import { getRedirect, getAccessToken } from "../controllers/twitter-login.controller";
// import validatePayloadMiddleware from "../middleware/validate-payload";

const router = express.Router();

router.get("/redirect", getRedirect);
router.get("/access_token", getAccessToken);

export default router;
