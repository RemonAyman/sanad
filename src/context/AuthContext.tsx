"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signOut, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "admin" | "child";
  stars: number;
  badges: string[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Automatically seed the admin account in Firebase Auth if it doesn't exist
  // This ensures the user can login with admin@gmail.com immediately
  const seedAdminAccount = async () => {
    try {
      // We attempt to register the admin email in Auth.
      // If it already exists, this will throw an error, which is fine and expected.
      const adminCred = await createUserWithEmailAndPassword(auth, "admin@gmail.com", "admin123");
      if (adminCred.user) {
        // Create user document in Firestore
        await setDoc(doc(db, "users", adminCred.user.uid), {
          uid: adminCred.user.uid,
          name: "مشرف سند",
          email: "admin@gmail.com",
          role: "admin",
          stars: 999,
          badges: ["مؤسس المنصة", "مرشد شجاع"],
        });
        console.log("Admin account successfully seeded in Firebase Auth.");
      }
    } catch (e: any) {
      // User already exists or other error, which we can ignore
      if (e.code === "auth/email-already-in-use") {
        // Just verify/create the admin profile document in Firestore just in case
        // Wait, onAuthStateChanged will handle reading it
      }
    }
  };

  const fetchProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchProfile(user.uid);
      setProfile(prof);
    }
  };

  useEffect(() => {
    // Seed admin once at startup
    seedAdminAccount();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        let prof = await fetchProfile(currentUser.uid);
        
        // If the profile document doesn't exist in Firestore (e.g. if they logged in via Auth but document was deleted), create it as a child
        if (!prof && currentUser.email !== "admin@gmail.com") {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            name: currentUser.displayName || "طفل شجاع",
            email: currentUser.email || "",
            role: "child",
            stars: 0,
            badges: ["بداية الرحلة"],
          };
          try {
            await setDoc(doc(db, "users", currentUser.uid), newProfile);
            prof = newProfile;
          } catch (e) {
            console.error("Error seeding profile on login:", e);
          }
        } else if (!prof && currentUser.email === "admin@gmail.com") {
          // If the profile is admin but firestore snap is missing, recreate it
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            name: "مشرف سند",
            email: "admin@gmail.com",
            role: "admin",
            stars: 999,
            badges: ["مؤسس المنصة", "مرشد شجاع"],
          };
          try {
            await setDoc(doc(db, "users", currentUser.uid), newProfile);
            prof = newProfile;
          } catch (e) {
            console.error("Error seeding admin profile on login:", e);
          }
        }
        
        setProfile(prof);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
