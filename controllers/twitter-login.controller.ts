import { Request, Response } from "express";
import { AccessOAuth2TokenArgs, TwitterApi } from "twitter-api-v2";

// MUST MAKE SURE THAT CALLBACK URL HERE EXACTLY MATCHES ONE ENTERED ON TWITTER DEVELOPER PORTAL:
const CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || "";

const getRedirect = (req: Request, res: Response) => {
    const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
    } as any);

    const { url, codeVerifier, state } = client.generateOAuth2AuthLink(CALLBACK_URL, {
        scope: ["tweet.read", "users.read", "offline.access"],
    });

    // Set original codeVerifier and State as Cookie:
    res.cookie("twitter_auth", JSON.stringify({ codeVerifier, state }), {
        maxAge: 15 * 60 * 1000, // 15 minutes
        secure: true,
        httpOnly: true,
        sameSite: true,
    });

    console.log("generated redirect:\n", JSON.stringify({ url, codeVerifier, state }));
    res.status(200).json({ url, codeVerifier, state });
};

const getAccessToken = (req: Request, res: Response) => {
    console.log("RECEIVED AT access_token:\n", req.body, req.params, req.query);
    console.log("req.cookies", req.cookies);

    // Extract state and code from query string
    const { state, authCode } = req.query;

    // Get the saved codeVerifier/state from cookie
    console.log("pulled cookie:", req.cookies.twitter_auth);
    const { authCode: codeVerifier, state: cookieState } = JSON.parse(req.cookies.twitter_auth);

    if (!codeVerifier || !state || !cookieState || !authCode) {
        return res.status(400).send("You denied the app or your session expired!");
    }
    // comparing original state from Step 1 of 3-legged Auth with one sent by user into this request. If same, means valid.
    if (state !== cookieState) {
        return res.status(400).send("Stored tokens didnt match!");
    }

    // Obtain access token
    const client = new TwitterApi({
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
    } as any);

    client
        .loginWithOAuth2({ code: authCode as string, codeVerifier, redirectUri: CALLBACK_URL })
        .then(async ({ client: loggedClient, accessToken, refreshToken, expiresIn }) => {
            // {loggedClient} is an authenticated client in behalf of some user
            // Store {accessToken} somewhere, it will be valid until {expiresIn} is hit.
            // If you want to refresh your token later, store {refreshToken} (it is present if 'offline.access' has been given as scope)

            // Example request
            const { data: userObject } = await loggedClient.v2.me();
            res.json({ data: userObject });
        })
        .catch(() => res.status(403).send("Invalid verifier or access tokens!"));

    res.status(200).json({ success: true });
};

export { getRedirect, getAccessToken };
