import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  hasSeenOnboarding: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>("guest");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("Resume User");
  const [avatarUri, setAvatarUri] = useState("");
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem("HAS_SEEN_ONBOARDING");
      if (value !== null) {
        setHasSeenOnboarding(true);
      }
    } catch (e) {
      console.error("Failed to fetch onboarding status", e);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem("HAS_SEEN_ONBOARDING", "true");
      setHasSeenOnboarding(true);
    } catch (e) {
      console.error("Failed to save onboarding status", e);
    }
  };

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
        hasSeenOnboarding,
        isLoading,
        completeOnboarding,
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
