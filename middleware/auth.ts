import { NextFunction, Request, Response } from "express";
import UnauthenticatedError from "../errors/unauthenticated";

import { getAuth } from "../db/firebase";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeaders = req.headers.authorization;

    // if no authHeader exists OR if the auth header doesn't start with "Bearer " then:
    if (!authHeaders || !authHeaders.startsWith("Bearer")) {
        throw new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!");
    }

    const token = authHeaders.split(" ")[1];

    getAuth()
        .verifyIdToken(token)
        .then(decodedToken => {
            console.log("decoded token: ", decodedToken);
            console.log("valid token!");
            next();
        })
        .catch((error: any) => {
            next(error);
            // next(new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!"));
        });
};

export default auth;
