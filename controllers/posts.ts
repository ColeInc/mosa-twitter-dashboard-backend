import { Request, Response } from "express";

const addPost = (req: Request, res: Response) => {
    res.send("testing add post");
};

export { addPost };
