/**
 * Script untuk menjadikan user pertama sebagai admin
 *
 * Cara menjalankan:
 * 1. Pastikan user sudah terdaftar melalui aplikasi
 * 2. Update email di bawah dengan email yang ingin dijadikan admin
 * 3. Jalankan: node -r dotenv/config src/scripts/makeAdmin.js
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Konstanta untuk role
const ROLES = {
  ADMIN: "RT5KL9", // Kode untuk admin
  CUSTOMER: "UE72MN", // Kode untuk customer
};

// Email yang akan dijadikan admin
const EMAIL_TO_PROMOTE = "youremail@example.com";

// Inisialisasi Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const db = getFirestore(app);

async function makeAdmin() {
  try {
    // Cari user berdasarkan email
    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("email", "==", EMAIL_TO_PROMOTE)
      .get();

    if (snapshot.empty) {
      console.error(`User dengan email ${EMAIL_TO_PROMOTE} tidak ditemukan`);
      process.exit(1);
    }

    // Update role menjadi admin
    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({
      role: ROLES.ADMIN,
      updatedAt: new Date(),
    });

    console.log(`Berhasil! User ${EMAIL_TO_PROMOTE} sekarang adalah admin.`);
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

makeAdmin();
