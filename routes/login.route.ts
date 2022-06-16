import express from "express";
import { getRedirect, getAccessToken, refreshToken } from "../controllers/twitter-auth.controller";
// import validatePayloadMiddleware from "../middleware/validate-payload";

const router = express.Router();

router.get("/redirect", getRedirect);
router.get("/access_token", getAccessToken);
router.get("/refresh_token", refreshToken);

export default router;
