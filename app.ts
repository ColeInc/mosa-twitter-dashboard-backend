import express from "express";
import { Request, Response } from "express";
import * as dotenv from "dotenv";
import "express-async-errors";

const app = express();
dotenv.config();

import notFoundMiddleware from "./middleware/not-found";
import errorHandlerMiddleware from "./middleware/error-handler";
import authenticateUser from "./middleware/auth";

import postsRoute from "./routes/posts.route";

app.use(express.json());

// routes
app.get("/ping", (req: Request, res: Response) => {
    res.status(200).json({ msg: "success!" });
});

app.use("/api/v1/posts", authenticateUser, postsRoute);
// app.use("/api/v1/posts", postsRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}... 🥝`);
});
