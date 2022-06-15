import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/**/*.test.ts"],
    verbose: true,
    forceExit: true,
    clearMocks: true,
};
export default config;

// /** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

// module.exports = {
//     preset: "ts-jest",
//     testEnvironment: "node",
//     testMatch: ["**/**/*.test.ts"],
//     verbose: true,
//     forceExit: true,
//     clearMocks: true,
// };
