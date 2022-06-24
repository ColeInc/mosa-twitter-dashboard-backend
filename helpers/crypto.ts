import path from "path";
import crypto from "crypto";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const algorithm = "aes-256-cbc";
const securityKey = process.env.CRYPTO_SECURITY_KEY!;
const initVector = process.env.CRYPTO_INIT_VECTOR!;

const encode = (message: string) => {
    const cipher = crypto.createCipheriv(algorithm, securityKey, initVector);
    let encryptedData = cipher.update(message, "utf-8", "hex");
    encryptedData += cipher.final("hex");
    return encryptedData;
};

const decode = (encryptedData: string) => {
    const decipher = crypto.createDecipheriv(algorithm, securityKey, initVector);
    let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
};

export { encode, decode };
