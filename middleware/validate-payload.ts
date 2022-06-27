import { Request, Response, NextFunction } from "express";
import { AnyZodObject } from "zod";

const validate = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
    console.log("validatePayloadMiddleware receives:");
    console.log(req.body, req.query, req.params);
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error: any) {
        return res.status(400).json(error);
    }
};

export default validate;
