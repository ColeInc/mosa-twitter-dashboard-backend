import jwt from "jsonwebtoken";
import { decode } from "../helpers/crypto";
import { NextFunction, Request, Response } from "express";
import UnauthenticatedError from "../errors/unauthenticated";
import jwtPayload from "../models/jwtPayload.model";

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token: string = req.cookies.twitter_jwt;
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwtPayload;
        const decodedAccessToken = decode(decoded.accessToken);
        console.log("AUTH decodedAccessToken", `>${decodedAccessToken}<`);
        next();
    } catch (error) {
        next(new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!"));
    }
};

export default auth;
