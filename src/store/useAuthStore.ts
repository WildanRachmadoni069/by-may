import { create } from "zustand";

interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

interface AuthState {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  initialized: boolean;
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signUp: (credentials: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<User | null>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isAdmin: false,
  loading: true,
  initialized: false,

  // Check authentication status on init
  checkAuth: async () => {
    try {
      set({ loading: true });

      const currentState = get();

      // Skip request if already initialized and not force refreshing
      if (currentState.initialized && currentState.currentUser) {
        set({ loading: false });
        return currentState.currentUser;
      }

      const response = await fetch("/api/auth/me", {
        credentials: "include", // Ensure cookies are sent
        cache: "no-store", // Don't cache this request
      });

      if (!response.ok) {
        set({
          currentUser: null,
          isAdmin: false,
          loading: false,
          initialized: true,
        });
        return null;
      }

      const data = await response.json();

      if (data.user) {
        // Explicitly check if role is admin
        const isUserAdmin = data.user.role === "admin";

        set({
          currentUser: data.user,
          isAdmin: isUserAdmin,
          loading: false,
          initialized: true,
        });
        return data.user;
      }

      set({
        currentUser: null,
        isAdmin: false,
        loading: false,
        initialized: true,
      });
      return null;
    } catch (error) {
      set({
        currentUser: null,
        isAdmin: false,
        loading: false,
        initialized: true,
      });
      return null;
    }
  },

  // Sign in a user with email and password
  signIn: async ({ email, password }) => {
    set({ loading: true });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign in");
      }

      const data = await response.json();

      set({
        currentUser: data.user,
        isAdmin: data.user.role === "admin",
        loading: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Sign up a new user
  signUp: async ({ fullName, email, password }) => {
    set({ loading: true });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to sign up");
      }

      set({ loading: false });
      // We don't sign the user in automatically after registration
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  // Sign out the current user
  signOut: async () => {
    set({ loading: true });

    try {
      await fetch("/api/auth/logout", {
        credentials: "include", // Important for cookies
        cache: "no-store", // Ensure we're not using any cached response
      });

      set({ currentUser: null, isAdmin: false, loading: false });

      // Invalidate all cache entries that require authentication
      if (typeof window !== "undefined") {
        // Clear any client-side cache we might be using
        sessionStorage.clear();
      }
    } catch (error) {
      // Still clear state even if API call fails
      set({ currentUser: null, isAdmin: false, loading: false });
    }
  },
}));

export default useAuthStore;
