import supertest from "supertest";
import { app } from "../app";

describe("login", () => {
    // redirect
    describe("get redirectURL", () => {
        describe("given that the redirect URL is formed successfully", () => {
            it("should return status code 200 and a valid URL/codeVerifier/state response", async () => {
                const { body, statusCode } = await supertest(app).get("/api/v1/login/redirect");

                expect(statusCode).toBe(200);
                expect(body).toEqual({
                    url: expect.any(String),
                    codeVerifier: expect.any(String),
                    state: expect.any(String),
                });
            });
        });
    });

    // access_token
    describe("get access_token", () => {
        describe("given the user does not provide a valid codeVerifer and state in request", () => {
            it("should return a 400 error & message saying invalid authCode/state", async () => {
                const { text, statusCode } = await supertest(app).get("/api/v1/login/access_token").query({
                    state: "zzzzz-invalid",
                });

                expect(statusCode).toBe(400);
                expect(text).toEqual('invalid "authCode" or "state" in request');
            });
        });

        describe("given there is NOT an existing original codeVerifer and state in cookie", () => {
            it("should return a 400 error", async () => {
                const { body, statusCode } = await supertest(app)
                    .get("/api/v1/login/access_token")
                    .query({
                        state: "zzzzz-invalid",
                        authCode: "zzzzz-invalid",
                    })
                    .set("Cookie", 'twitter_auth={ "codeVerifier": "zzz" }');

                expect(statusCode).toBe(400);
            });
        });

        describe("given the original state from cookie does not match the state passed in access_token request query parameters", () => {
            it("should return a 400 error & msg saying stored tokens didn't match", async () => {
                const { text, statusCode } = await supertest(app)
                    .get("/api/v1/login/access_token")
                    .query({
                        state: "xxx",
                        authCode: "yyy",
                    })
                    .set("Cookie", 'twitter_auth={ "codeVerifier": "yyy", "state": "xxB" }');

                expect(statusCode).toBe(400);
                expect(text).toEqual("Stored tokens didnt match!");
            });
        });
    });

    // refresh_token
    //// confirm that we get valid access token returned if we provide valid access token
    //// confirm error handling works aka gives 403, etc.
});
