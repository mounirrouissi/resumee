import React, { createContext, useContext, useState, ReactNode } from "react";

type UserContextType = {
  displayName: string;
  setDisplayName: (name: string) => void;
  avatarUri: string;
  setAvatarUri: (uri: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [displayName, setDisplayName] = useState("Resume User");
  const [avatarUri, setAvatarUri] = useState("");

  return (
    <UserContext.Provider
      value={{
        displayName,
        setDisplayName,
        avatarUri,
        setAvatarUri,
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
