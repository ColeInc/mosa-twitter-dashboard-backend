import { NextFunction, Request, Response } from "express";
import jwtPayload from "../models/jwtPayload.model";
import { encode } from "../helpers/crypto";
import jwt from "jsonwebtoken";

const createJwtAndSetCookie = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userData = res.locals.userData;
        const accessToken = res.locals.accessToken;
        const refreshToken = res.locals.refreshToken;
        const expiresIn = res.locals.expiresIn;

        // Generate payload for JWT token:
        const payload: jwtPayload = {
            id: userData.id,
            name: userData.name,
            username: userData.username,
            accessToken: encode(accessToken),
            refreshToken: encode(refreshToken),
            expiresIn: expiresIn,
        };

        // Create JWT token itself:
        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: 24 * 60 * 60 * 1000, // 24 hrs
        });
        console.log("created JWT:", token);

        // Store JWT into httpOnly Cookie:
        res.cookie("twitter_jwt", token, {
            maxAge: 24 * 60 * 60 * 1000, // 24 hrs
            secure: true,
            httpOnly: true,
            sameSite: true,
        });

        console.log("3 get here");
        next();
    } catch (error) {
        console.log(error);
        res.status(400).send("Failed to create JWT token and set it as cookie." + error);
    }
};

export default createJwtAndSetCookie;
