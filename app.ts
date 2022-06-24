import express from "express";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import "express-async-errors";

import helmet from "helmet";
import cors from "cors";
// import xss from "xss-clean";
import rateLimit from "express-rate-limit";

import notFoundMiddleware from "./middleware/not-found";
import errorHandlerMiddleware from "./middleware/error-handler";
import authenticateUser from "./middleware/authentication";

import postsRoute from "./routes/posts.route";
import loginRoute from "./routes/login.route";

export const app = express();
dotenv.config();

const rateLimitHandler = (req: Request, res: Response) => {
    return res.status(429).json({
        error: "You hit the request limit. Please wait a while then try again",
    });
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: rateLimitHandler,
});

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
// app.use(xss());
app.use(limiter);

/* ----------------- Routes ----------------- */

app.get("/api/v1/ping", (req: Request, res: Response) => {
    res.status(200).json({ msg: "pong!" });
});

app.use("/api/v1/posts", authenticateUser, postsRoute);
// app.use("/api/v1/posts", postsRoute);

app.use("/api/v1/login", loginRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}... 🥝`);
});
