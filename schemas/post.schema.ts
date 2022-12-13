import { z, object, string } from "zod";

const postSchema = object({
    body: object({
        id: string().optional(),
        threadId: string({ invalid_type_error: "Invalid Thread ID" }).optional(),
        type: z.enum(["queue", "drafts", "tweet"], {
            required_error: "Post Type is required",
        }),
        body: string({
            required_error: "Post body is required",
        }),
        media: string({ invalid_type_error: "Invalid media type" }).optional(),
        scheduledTime: string({
            required_error: "Post's Scheduled Time is required",
        }),
    }),
});

export default postSchema;
