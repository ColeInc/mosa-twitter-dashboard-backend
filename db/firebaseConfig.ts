const admin = require("firebase-admin");
const serviceAccount = require("../db/serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // databaseURL: `https://${process.env.FIREBASE_DB_NAME}.firebaseio.com`,
});

const db = admin.firestore();

export default db;
