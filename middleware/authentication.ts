import jwt, { TokenExpiredError } from "jsonwebtoken";
import { decode } from "../helpers/crypto";
import { NextFunction, Request, Response } from "express";
import UnauthenticatedError from "../errors/unauthenticated";
import validatePayload from "../middleware/validate-payload";
import jwtPayload from "../models/jwtPayload.model";
import jwtSchema from "../schemas/jwt.schema";
import { TwitterApi } from "twitter-api-v2";
import fetchNewAccessToken from "./fetch-new-acess-token";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.cookies.twitter_jwt) {
            next(new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!"));
        }
        const token: string = req.cookies.twitter_jwt;
        const decodedJWT = jwt.verify(token, process.env.JWT_SECRET!) as jwtPayload;

        // Validate structure of jwt payload:
        validatePayload(jwtSchema);

        try {
            // Testing invalid access_token:
            // const decodedAccessToken = "E2lKXzExdTlLZEVrakI4R1VYRFd4eVo2VnhSTENmaTN2ZVQ4MDlyUmIwUi1lOjE2NTY0NzA2NjU2NjE6MToxOmF0OjE";
            // const client = new TwitterApi(decodedAccessToken);

            // Attempt to fetch userData from Twitter with provided access_token. As long as error doesn't occur here we know it is valid.
            const client = new TwitterApi(decode(decodedJWT.accessToken));
            const validResponse = await client.v2.me();

            // if successful, store it in res.locals for subsequent controllers to use:
            res.locals.twitterClient = client;
            res.locals.jwt = decodedJWT;
            next();
        } catch (error) {
            console.log(
                "failed to create twitter API client using provided access token. trying refresh_token to fetch new one...\n" +
                    error
            );

            /* If it gets to here it means we failed to create the 
            twitter API client with received access_token.
            Now we need to try generating new access_token via 
            received refresh_token and try generating client that 
            way (we assume old access_token expired). */

            res.locals.refreshToken = decode(decodedJWT.refreshToken);
            fetchNewAccessToken(req, res, next);
        }
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
