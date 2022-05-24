const { UnauthenticatedError } = require("../errors");

// Firebase init
const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = {
    project_id: process.env.project_id,
    private_key_id: process.env.private_key_id,
    private_key: process.env.private_key.replace(/\\n/g, "\n"),
    client_email: process.env.client_email,
    client_id: process.env.client_id,
    auth_uri: process.env.auth_uri,
    token_uri: process.env.token_uri,
    auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.client_x509_cert_url,
};

initializeApp({
    credential: cert(serviceAccount),
});

const auth = async (req, res, next) => {
    const authHeaders = req.headers.authorization;

    // if no authHeader exists OR if the auth header doesn't start with "Bearer " then:
    if (!authHeaders || !authHeaders.startsWith("Bearer")) {
        throw new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!");
    }

    const token = authHeaders.split(" ")[1];

    getAuth()
        .verifyIdToken(token)
        .then(decodedToken => {
            console.log("decoded token: ", decodedToken);
            console.log("valid token!");
            next();
        })
        .catch(error => {
            next(error);
            // next(new UnauthenticatedError("Failed to authenticate request. Please provide valid bearer token!"));
        });
};

module.exports = auth;
