import React, { createContext, useContext, useState, useEffect } from "react";
import type { FirebaseAuthTypes } from "@react-native-firebase/auth";
import firebaseService from "../services/firebaseService";

type AuthContextType = {
  user: FirebaseAuthTypes.User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ error: any; user: FirebaseAuthTypes.User | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      // Initialize Firebase first
      firebaseService.initializeFirebase().then(() => {
        // Check initial auth state
        const currentUser = firebaseService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }

        // Listen for auth state changes
        const unsubscribe = firebaseService.onAuthChange((user) => {
          setUser(user);
          setIsLoading(false);
        });

        // Return cleanup function to React
        return () => unsubscribe();
      });
    } catch (error) {
      console.error("Auth setup error:", error);
      setIsLoading(false);
    }
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    const { user, error } = await firebaseService.signIn(email, password);
    return { error };
  };

  const handleSignUp = async (email: string, password: string) => {
    const { user, error } = await firebaseService.signUp(email, password);
    return { error, user };
  };

  const handleSignOut = async () => {
    await firebaseService.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
