import jwt, { TokenExpiredError } from "jsonwebtoken";
import { decode } from "../helpers/crypto";
import { NextFunction, Request, Response } from "express";
import UnauthenticatedError from "../errors/unauthenticated";
import validatePayload from "../middleware/validate-payload";
import jwtPayload from "../models/jwtPayload.model";
import jwtSchema from "../schemas/jwt.schema";
import { TwitterApi } from "twitter-api-v2";
import createJwtAndSetCookie from "./create-jwt-and-cookie";
import fetchNewAccessToken from "./fetch-new-acess-token";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.cookies.twitter_jwt) {
            next(new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!"));
        }
        const token: string = req.cookies.twitter_jwt;
        const decodedJWT = jwt.verify(token, process.env.JWT_SECRET!) as jwtPayload;

        // validate structure of jwt payload:
        validatePayload(jwtSchema);
        console.log("valid jwt payload!");

        try {
            // Attempt to create new twitter API client instance with provided access_token:
            // const client = new TwitterApi(decode(decodedJWT.accessToken));
            const client = new TwitterApi(
                decode(
                    "12a67a84176a1f462158e24d1c9925c18aa85595dda2037a4500ebd98aa70d2e9233a74ce0269731dffb269fdb6e308b3a099777f2f15bd7b816a93548c2381872482669c347af7d94db8c1ec82ae954313cae942da08d1fb7b767d4501fefa"
                )
            );
            console.log("valid access token!");

            // if successful, store it in res.locals for subsequent controllers to use:
            res.locals.twitterClient = client;
            // const { data: userObject } = await client.v2.me();
            // console.log(userObject);
            // res.json(userObject);
        } catch (error) {
            /* If it gets to here it means we failed to create the 
            twitter API client with received access_token.
            Now we need to try generating new access_token via 
            received refresh_token and try generating client that 
            way (we assume old access_token expired). */

            res.locals.refreshToken = decode(decodedJWT.refreshToken);

            console.log(
                "failed to create twitter API client using provided access token. trying refresh_token to fetch new one...\n" +
                    error
            );
            fetchNewAccessToken(req, res, next);
        }
        console.log("gets to right before calling next() at authenticate - without error");
        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            console.log(error);
            next(new UnauthenticatedError("Failed to authenticate request. JWT Token expired!"));
        }
        console.log(error);
        next(new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!"));
    }
};

export default auth;
