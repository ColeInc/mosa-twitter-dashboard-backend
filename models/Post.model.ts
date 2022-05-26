interface Post {
    id: string;
    threadId: string | null;
    type: "queue" | "drafts" | "tweet";
    body: string;
    media: string | null;
    scheduledTime: string;
}

export default Post;
