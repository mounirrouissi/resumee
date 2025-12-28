import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform, Alert } from "react-native";
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";

// Replace with your actual RevenueCat API Keys
const API_KEYS = {
  apple: "appl_PLACEHOLDER_IOS", // LOOK FOR 'appl_' KEY
  google: "goog_QBWwCoAiOgDVxgTkceZciGsxJSX", // LOOK FOR 'goog_' KEY
};

interface RevenueCatContextType {
  isPro: boolean;
  currentOffering: PurchasesPackage | null;
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  isLoading: boolean;
}

const RevenueCatContext = createContext<RevenueCatContextType | undefined>(
  undefined,
);

export function RevenueCatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isPro, setIsPro] = useState(false);
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initRevenueCat();
  }, []);

  const initRevenueCat = async () => {
    try {
      if (Platform.OS === "ios") {
        Purchases.configure({ apiKey: API_KEYS.apple });
      } else if (Platform.OS === "android") {
        Purchases.configure({ apiKey: API_KEYS.google });
      }

      const customerInfo = await Purchases.getCustomerInfo();
      checkEntitlements(customerInfo);

      const offerings = await Purchases.getOfferings();
      if (offerings.current && offerings.current.availablePackages.length > 0) {
        setCurrentOffering(offerings.current.availablePackages[0]);
      }
    } catch (e) {
      console.log("RevenueCat init error (expected in dev without keys):", e);
      // For development/demo purposes without keys, we might want to simulate or just stay free
    } finally {
      setIsLoading(false);
    }
  };

  const checkEntitlements = (customerInfo: CustomerInfo) => {
    if (customerInfo.entitlements.active["pro_access"]) {
      setIsPro(true);
    } else {
      setIsPro(false);
    }
  };

  const purchasePackage = async (pack: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      checkEntitlements(customerInfo);
    } catch (e: any) {
      if (!e.userCancelled) {
        Alert.alert("Purchase Error", e.message);
      }
    }
  };

  const restorePurchases = async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      checkEntitlements(customerInfo);
      if (customerInfo.entitlements.active["pro_access"]) {
        Alert.alert("Success", "Purchases restored!");
      } else {
        Alert.alert("Notice", "No active subscriptions found.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{
        isPro,
        currentOffering,
        purchasePackage,
        restorePurchases,
        isLoading,
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
}

export const useRevenueCat = () => {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error("useRevenueCat must be used within a RevenueCatProvider");
  }
  return context;
};
