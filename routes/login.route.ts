import express from "express";
import { getRedirect, getAccessToken, refreshToken, logout } from "../controllers/twitter-auth.controller";
import authenticateUser from "../middleware/authentication";

const router = express.Router();

router.get("/redirect", getRedirect);
router.get("/access_token", getAccessToken);
router.get("/refresh_token", authenticateUser, refreshToken);
router.get("/logout", logout);

export default router;
