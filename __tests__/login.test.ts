import supertest from "supertest";
import { app } from "../app";

describe("login", () => {
    describe("get redirectURL route", () => {
        describe("given we fail to form the redirect URL", () => {
            it("should return status code 200 and a valid URL", async () => {
                const { body, statusCode } = await supertest(app).get("/api/v1/redirect").expect(400);
            });
        });

        describe("given that we form the redirect URL successfully", () => {
            it("should return status code 200 and a valid URL", async () => {
                const { body, statusCode } = await supertest(app).get("/api/v1/redirect");

                expect(statusCode).toBe(200);
                // expect(body).toBe();
            });
        });
    });
});
