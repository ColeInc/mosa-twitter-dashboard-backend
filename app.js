const express = require("express");
const app = express();
const postsRoute = require("./routes/posts");

app.use(express.json());

// routes
app.use("/", (req, res) => {
    res.status(200).json({ msg: "success!" });
});

app.use("/api/v1/posts", postsRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`server is listening on port ${port}...`);
});
