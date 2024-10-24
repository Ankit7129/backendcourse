const admin = require('firebase-admin');
require('dotenv').config();

// Create the service account object from environment variables
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Ensure line breaks in the private key
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin with the service account
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET, // Optional: If you're using Firebase Storage
});
const bucket = admin.storage().bucket();
module.exports = { admin, bucket };
