import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/firebaseConfig";
import {
  signIn as firebaseSignIn,
  signUp as firebaseSignUp,
  logOut as firebaseLogOut,
  getUserData,
  UserData,
  SignInData,
  SignUpData,
  isUserAdmin,
} from "@/lib/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { ROLES } from "@/lib/constants/roles";

interface AuthState {
  currentUser: FirebaseUser | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
  initialized: boolean;

  // Actions
  signIn: (data: SignInData) => Promise<void>;
  signUp: (data: SignUpData) => Promise<UserData>;
  logOut: () => Promise<void>;

  // Internal actions
  setCurrentUser: (user: FirebaseUser | null) => void;
  setUserData: (data: UserData | null) => void;
  setLoading: (isLoading: boolean) => void;
  setIsAdmin: (isAdmin: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      userData: null,
      loading: true,
      isAdmin: false,
      initialized: false,

      // Actions
      signIn: async (data: SignInData) => {
        try {
          const userCredential = await firebaseSignIn(data);
          // State akan di-update melalui onAuthStateChanged listener
        } catch (error) {
          console.error("Error signing in:", error);
          throw error;
        }
      },

      signUp: async (data: SignUpData) => {
        try {
          const userData = await firebaseSignUp(data);
          return userData;
        } catch (error) {
          console.error("Error signing up:", error);
          throw error;
        }
      },

      logOut: async () => {
        try {
          await firebaseLogOut();
          // State akan di-update melalui onAuthStateChanged listener
        } catch (error) {
          console.error("Error logging out:", error);
          throw error;
        }
      },

      // Internal actions
      setCurrentUser: (user) => set({ currentUser: user }),
      setUserData: (data) => set({ userData: data }),
      setLoading: (isLoading) => set({ loading: isLoading }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setInitialized: (initialized) => set({ initialized }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        currentUser: null, // Don't persist sensitive data
        userData: state.userData
          ? {
              uid: state.userData.uid,
              email: state.userData.email,
              fullName: state.userData.fullName,
              role: state.userData.role,
              createdAt: state.userData.createdAt,
              updatedAt: state.userData.updatedAt,
            }
          : null,
        isAdmin: state.isAdmin,
      }),
    }
  )
);

// Initialize auth state listener
if (typeof window !== "undefined") {
  onAuthStateChanged(auth, async (user) => {
    // Removed unsubscribe variable since it's not used
    const state = useAuthStore.getState();

    state.setCurrentUser(user);

    if (user) {
      try {
        // Fetch user data
        const userDataFromFirestore = await getUserData(user.uid);
        state.setUserData(userDataFromFirestore);

        // Check if user is admin
        state.setIsAdmin(userDataFromFirestore?.role === ROLES.ADMIN);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    } else {
      state.setUserData(null);
      state.setIsAdmin(false);
    }

    if (!state.initialized) {
      state.setInitialized(true);
    }

    // Add a small delay for loading screen UX
    setTimeout(() => {
      state.setLoading(false);
    }, 1000);
  });
}

export default useAuthStore;
