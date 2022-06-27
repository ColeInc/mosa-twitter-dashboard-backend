import { z, object, string } from "zod";

const jwtSchema = object({
    body: object({
        id: string({
            required_error: "jwt > ID is required",
        }),
        name: string({ required_error: "jwt > twitter display name is required" }),
        username: string({ required_error: "jwt > twitter username is required" }),
        accessToken: string({
            required_error: "jwt > accessToken is required",
        }),
        refreshToken: string({
            required_error: "jwt > refreshToken is required",
        }),
        expiresIn: z.number({ required_error: "jwt > expiresIn is required" }),
    }),
});

export default jwtSchema;
