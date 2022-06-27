import { Request, Response } from "express";
import { TwitterApi } from "twitter-api-v2";
import { decode } from "../helpers/crypto";

const getPosts = async (req: Request, res: Response) => {
    try {
        console.log("gets to /posts");
        // Establish twitter client with access token out of JWT:
        // const accessToken = decode(res.locals.jwt.accessToken);
        // const client = new TwitterApi(accessToken);
        // const client = new TwitterApi(
        //     "WFdKaGhjbzV0eWdKeTFNUTIycDJ1aElNdlVQdkpYRmdEWEEzcGJnVU5GdEREOjE2NTYwNDg2NjAxOTg6MTowOmF0OjE"
        // );
        const client = res.locals.twitterClient;
        const { data: userObject } = await client.v2.me();
        console.log("userData at posts:", userObject);
        res.json(userObject);
        // res.send("*imagine this is a list of posts fetched back*");
    } catch (error) {
        res.status(400).send("failed to get posts:\n" + error);
    }
};

const addPost = (req: Request, res: Response) => {
    try {
        // TODO: insert post into firebase db here

        console.log("received body:\n", req.body);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ msg: "Failed to store post in backend.", error, success: false });
    }
};

export { getPosts, addPost };
