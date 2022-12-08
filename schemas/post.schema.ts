import { z, object, string } from "zod";

const postSchema = object({
    body: object({
        // id: string({
        //     required_error: "ID is required",
        // }).optional(),
        id: z.optional(z.string()),
        threadId: string({ invalid_type_error: "Invalid Thread ID" }).nullable(),
        type: z.enum(["queue", "drafts", "tweet"], {
            required_error: "Post Type is required",
        }),
        body: string({
            required_error: "Post body is required",
        }),
        media: string({ invalid_type_error: "Invalid media type" }).nullable(),
        scheduledTime: string({
            required_error: "Post's Scheduled Time is required",
        }),
    }),
});

export default postSchema;
