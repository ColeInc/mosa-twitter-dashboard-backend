import express from "express";
import cookieParser from "cookie-parser";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import "express-async-errors";

export const app = express();
dotenv.config();

import notFoundMiddleware from "./middleware/not-found";
import errorHandlerMiddleware from "./middleware/error-handler";
import authenticateUser from "./middleware/auth";

import postsRoute from "./routes/posts.route";
import loginRoute from "./routes/login.route";

app.use(express.json());
app.use(cookieParser());

/* ----------------- Routes ----------------- */

app.get("/ping", (req: Request, res: Response) => {
    res.status(200).json({ msg: "success!" });
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
