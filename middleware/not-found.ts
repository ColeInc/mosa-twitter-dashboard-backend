import { Request, Response } from "express";

const notFound = (req: Request, res: Response) => res.status(404).send("Page does not exist!");

export default notFound;
