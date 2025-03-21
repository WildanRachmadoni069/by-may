import { auth, db } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { ROLES, UserRole, isAdminRole } from "@/lib/constants/roles";

// Type untuk data pengguna
export interface UserData {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Type untuk input registrasi
export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
}

// Type untuk input login
export interface SignInData {
  email: string;
  password: string;
}

// Fungsi untuk mendaftarkan pengguna baru
export const signUp = async (userData: SignUpData): Promise<UserData> => {
  try {
    // 1. Buat user di Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    const user = userCredential.user;

    // 2. Buat dokumen user di Firestore
    const userDocData = {
      uid: user.uid,
      email: userData.email,
      fullName: userData.fullName,
      role: ROLES.CUSTOMER, // Default role dengan kode customer
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Simpan data ke collection 'users'
    await setDoc(doc(db, "users", user.uid), userDocData);

    return {
      ...userDocData,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserData;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Fungsi untuk login
export const signIn = async (userData: SignInData): Promise<UserCredential> => {
  try {
    // Hanya melakukan autentikasi dengan Firebase Auth
    return await signInWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Fungsi untuk logout
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan data pengguna dari Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<
        UserData,
        "createdAt" | "updatedAt"
      > & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
      };

      return {
        ...userData,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      };
    }

    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    throw error;
  }
};

// Fungsi untuk memeriksa apakah pengguna adalah admin
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    const userData = await getUserData(uid);
    return userData?.role === ROLES.ADMIN;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Fungsi untuk mengubah role pengguna menjadi admin
export const promoteToAdmin = async (email: string): Promise<boolean> => {
  try {
    // Mencari user berdasarkan email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error(`User dengan email ${email} tidak ditemukan`);
      return false;
    }

    // Update role menjadi admin
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, "users", userDoc.id), {
      role: ROLES.ADMIN,
      updatedAt: serverTimestamp(),
    });

    console.log(`User ${email} berhasil dijadikan admin`);
    return true;
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw error;
  }
};

// Fungsi untuk mendapatkan semua admin
export const getAllAdmins = async (): Promise<UserData[]> => {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "==", ROLES.ADMIN));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data() as Omit<UserData, "createdAt" | "updatedAt"> & {
        createdAt: Timestamp;
        updatedAt: Timestamp;
      };

      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  } catch (error) {
    console.error("Error getting admins:", error);
    throw error;
  }
};
