import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

if (!admin.apps.length) {
  const serviceAccountPath = path.join(process.cwd(), "service_account.json");
  if (fs.existsSync(serviceAccountPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      storageBucket: process.env.STORAGE_BUCKET,
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      storageBucket: process.env.STORAGE_BUCKET,
    });
  }
}

// firebase services
const db = admin.firestore;
const storage = admin.storage().bucket();

db().settings({ databaseId: process.env.FIRESTORE_DB_ID });

export const firebase = {
  db,
  storage,
  auth: admin.auth,
};

export const getFirebaseEmail = (email: string) => {
  const [prefix, domain] = email.split("@");
  return `${prefix}+${process.env.NODE_ENV || "dev"}@${domain}`;
};
