import { Request, Response } from "express";

const getPosts = (req: Request, res: Response) => {
    res.send("*imagine this is a list of posts fetched back*");
};

const addPost = (req: Request, res: Response) => {
    try {
        // TODO: insert post into firebase db

        console.log("received body:\n", req.body);
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ msg: "Failed to store post in backend.", error, success: false });
    }
};

export { getPosts, addPost };
