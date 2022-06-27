import { NextFunction, Request, Response } from "express";
import { UnauthenticatedError } from "../errors";
import { TwitterApi } from "twitter-api-v2";
import createJwtAndSetCookie from "./create-jwt-and-cookie";

const fetchNewAccessToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // if access_token invalid, try fetching new valid one with received refresh_token:
        const client = new TwitterApi({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET,
        } as any);

        const {
            client: refreshedClient,
            accessToken,
            refreshToken: newRefreshToken,
            expiresIn,
        } = await client.refreshOAuth2Token(res.locals.refreshToken);

        // Fetch fresh basic user info to be stored in updated JWT:
        const { data: userData } = await refreshedClient.v2.me({ "user.fields": ["profile_image_url"] });

        res.locals.userData = userData;
        res.locals.accessToken = accessToken;
        res.locals.refreshToken = newRefreshToken;
        res.locals.expiresIn = expiresIn;

        res.locals.twitterClient = refreshedClient;

        // create new JWT token & store it into cookie:
        createJwtAndSetCookie(req, res, next);
        next();
    } catch (error) {
        console.log(error);
        next(
            new UnauthenticatedError(
                "Failed to generate valid access_token from received refresh_token. Invalid JWT was provided!"
            )
        );
    }
};

export default fetchNewAccessToken;
