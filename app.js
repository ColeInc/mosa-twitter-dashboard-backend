require("dotenv").config();
require("express-async-errors");
const express = require("express");
const app = express();

const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const authenticateUser = require("./middleware/auth");
const postsRoute = require("./routes/posts");

app.use(express.json());

// routes
app.get("/", (req, res) => {
    res.status(200).json({ msg: "success!" });
});

app.use("/api/v1/posts", authenticateUser, postsRoute);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}... 🥝`);
});
