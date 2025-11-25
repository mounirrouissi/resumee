import React, { createContext, useContext, useState, ReactNode } from "react";

type UserType = "guest" | "google";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  picture?: string;
};

type UserContextType = {
  isAuthenticated: boolean;
  userType: UserType;
  userProfile: UserProfile | null;
  displayName: string;
  setDisplayName: (name: string) => void;
  avatarUri: string;
  setAvatarUri: (uri: string) => void;
  signInWithGoogle: (profile: UserProfile) => void;
  continueAsGuest: () => void;
  signOut: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>("guest");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("Resume User");
  const [avatarUri, setAvatarUri] = useState("");

  const signInWithGoogle = (profile: UserProfile) => {
    setIsAuthenticated(true);
    setUserType("google");
    setUserProfile(profile);
    setDisplayName(profile.name);
    setAvatarUri(profile.picture || "");
  };

  const continueAsGuest = () => {
    setIsAuthenticated(true);
    setUserType("guest");
    setUserProfile(null);
    setDisplayName("Guest User");
    setAvatarUri("");
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUserType("guest");
    setUserProfile(null);
    setDisplayName("Resume User");
    setAvatarUri("");
  };

  return (
    <UserContext.Provider
      value={{
        isAuthenticated,
        userType,
        userProfile,
        displayName,
        setDisplayName,
        avatarUri,
        setAvatarUri,
        signInWithGoogle,
        continueAsGuest,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
