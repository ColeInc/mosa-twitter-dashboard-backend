import { Request, Response } from "express";
import { TwitterApi } from "twitter-api-v2";
import jwt from "jsonwebtoken";
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
    console.log("pulled cookie:", req.cookies.twitter_auth);
    const { codeVerifier, state: cookieState } = JSON.parse(req.cookies.twitter_auth);
    console.log("all 4 together:", { codeVerifier, state, cookieState, authCode });

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
            console.log("Step 3 fetched: ", { loggedClient, accessToken, refreshToken, expiresIn });

            // Fetch basic user info:
            const { data: userData } = await loggedClient.v2.me({ "user.fields": ["profile_image_url"] });

            // Create JWT token with user data in it:
            const payload = {
                id: userData.id,
                name: userData.name,
                username: userData.username,
                accessToken: accessToken,
                refreshToken: refreshToken,
                expiresIn: expiresIn,
            };

            const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: expiresIn });
            console.log("calced JWT:", token);

            // Store final JWT in cookie:
            res.cookie("twitter_jwt", token, {
                maxAge: expiresIn,
                secure: true,
                httpOnly: true,
                sameSite: true,
            });

            res.status(200).json({ userData, success: true });
        })
        .catch(() => res.status(403).send("Invalid verifier or access token provided!"));
};

const refreshToken = async (req: Request, res: Response) => {
    // Pull refresh token from unpackaged JWT:
    //TODO:
    const refreshToken = "";

    const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
    } as any);

    const {
        client: refreshedClient,
        accessToken,
        refreshToken: newRefreshToken,
    } = await client.refreshOAuth2Token(refreshToken);

    // Store refreshed {accessToken} and {newRefreshToken} to replace the old ones
    //REPACKAGE INTO JWT + STORE IN COOKIE. BEST TO CREATE DEDICATED FUNCTIONS TO DO THIS since doing in multiple places.
    res.send("**imagine this is refreshed**");
    // res.status(200).json({ success: true });
};

export { getRedirect, getAccessToken, refreshToken };
