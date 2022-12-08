import { Request, Response } from "express";
import db from "../db/firebaseConfig";
// import { TwitterApi } from "twitter-api-v2";
// import { decode } from "../helpers/crypto";

const getPosts = async (req: Request, res: Response) => {
    try {
        // Establish twitter client with access token out of JWT, then fetch user details:
        const userId = res.locals.userData.id;

        let query = db.collection("Person").doc(userId).collection("Posts");

        // Check if any specified Type of Post is wanted, otherwise return all Queued/Draft Posts:
        if (req.query.type) {
            query = query.where("type", "==", req.query.type);
        }

        const snapshot = await query.get();
        const posts = snapshot.docs.map((doc: any) => doc.data());

        res.json(posts);
    } catch (error) {
        res.status(400).send("failed to get posts from firestore db:\n" + error);
    }
};

const createPost = async (req: Request, res: Response) => {
    try {
        console.log("received body:\n", req.body);

        // Using the user's existing Twitter ID as the document ID so that we have a re-usable globally unique ID to easily fetch their info from in future:
        const userId = res.locals.userData.id;

        const postCreated = await db.collection("Person").doc(userId).collection("Posts").add(req.body);

        res.status(200).json({
            id: postCreated.id,
            success: true,
        });
    } catch (error) {
        res.status(400).json({ msg: "Failed to create post in firestore db.\n", error, success: false });
    }
};

const updatePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = res.locals.userData.id;

        await db.collection("Person").doc(userId).collection("Posts").doc(postId).update(req.body);

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ msg: "Failed to udpate post in firestore db.\n", error, success: false });
    }
};

const deletePost = async (req: Request, res: Response) => {
    try {
        const { postId } = req.params;
        const userId = res.locals.userData.id;

        await db.collection("Person").doc(userId).collection("Posts").doc(postId).delete();

        res.status(200).json({ success: true });
    } catch (error) {
        res.status(400).json({ msg: "Failed to delete post in firestore db.\n", error, success: false });
    }
};

export { getPosts, createPost, updatePost, deletePost };
