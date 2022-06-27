import jwt from "jsonwebtoken";
import { decode } from "../helpers/crypto";
import { TwitterApi } from "twitter-api-v2";
import { NextFunction, Request, Response } from "express";
import { UnauthenticatedError } from "../errors";
import jwtPayload from "../models/jwtPayload.model";
import createJwtAndSetCookie from "../middleware/create-jwt-and-cookie";

const { sign, verify } = jwt;

const getRedirect = (req: Request, res: Response) => {
    const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
    } as any);

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(process.env.TWITTER_CALLBACK_URL!, {
        scope: ["tweet.read", "users.read", "offline.access"],
    });

    // Set original codeVerifier and State as Cookie:
    res.cookie("twitter_auth", JSON.stringify({ codeVerifier, state }), {
        maxAge: 15 * 60 * 1000, // 15 mins
        secure: true,
        httpOnly: true,
        sameSite: true,
    });

    res.status(200).json({ url, codeVerifier, state });
};

const getAccessToken = (req: Request, res: Response) => {
    if (!req.query || !req.query.state || !req.query.authCode) {
        return res.status(400).send('invalid "authCode" or "state" in request');
    }

    // Extract state and code from query string
    const { state, authCode } = req.query;

    // Get the saved codeVerifier/state from cookie
    console.log("pulled cookie @ /access_token:", req.cookies.twitter_auth);
    const { codeVerifier, state: cookieState } = JSON.parse(req.cookies.twitter_auth);

    if (!codeVerifier || !state || !cookieState || !authCode) {
        return res.status(400).send("You denied authorization to the app or your session expired!");
    }
    // comparing original state from Step 1 of 3-legged Auth with one sent by user into this request. If same, means valid.
    if (state !== cookieState) {
        return res.status(400).send("Stored tokens didnt match!");
    }

    const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
    } as any);

    // Obtain access token & refresh token
    client
        .loginWithOAuth2({ code: authCode as string, codeVerifier, redirectUri: process.env.TWITTER_CALLBACK_URL! })
        .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
            console.log("fetched from twitter @ /access_token: ", {
                loggedClient,
                accessToken,
                refreshToken,
                expiresIn,
            });
            console.log("@@@ OG refresh:", refreshToken);

            // Fetch basic user info:
            const { data: userData } = await loggedClient.v2.me({ "user.fields": ["profile_image_url"] });

            res.locals.userData = userData;
            res.locals.accessToken = accessToken;
            res.locals.refreshToken = refreshToken;
            res.locals.expiresIn = expiresIn;
            const callback = () => res.status(200).json({ userData, success: true });
            createJwtAndSetCookie(req, res, callback);
        })
        .catch(() => res.status(403).send("Invalid verifier or access token provided!"));
};

const refreshToken = async (req: Request, res: Response) => {
    try {
        // Pull refresh token from unpackaged JWT:
        const refreshToken = decode(res.locals.jwt.refreshToken);
        console.log("DECODED refreshToken", `>${refreshToken}<`);

        const client = new TwitterApi({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
        } as any);

        const {
            client: refreshedClient,
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
        } = await client.refreshOAuth2Token(refreshToken);

        // Fetch basic user info:
        const { data: userData } = await refreshedClient.v2.me({ "user.fields": ["profile_image_url"] });

        res.locals.userData = userData;
        res.locals.accessToken = accessToken;
        res.locals.refreshToken = newRefreshToken;
        res.locals.expiresIn = expiresIn;

        const callback = () => res.status(200).json({ userData, success: true });
        createJwtAndSetCookie(req, res, callback);
    } catch (error) {
        res.status(403).send("Failed to fetch new access_token with provided refresh_token :(" + error);
    }
};

const logout = (req: Request, res: Response) => {
    res.clearCookie("twitter_auth");
    res.clearCookie("twitter_jwt");
    res.json({ success: true });
};

export { getRedirect, getAccessToken, refreshToken, logout };
