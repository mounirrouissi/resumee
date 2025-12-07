import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import UploadScreen from "@/screens/UploadScreen";
import PreviewScreen from "@/screens/PreviewScreen";
import PricingScreen from "@/screens/PricingScreen";
import { HeaderTitle } from "@/components/HeaderTitle";
import { useTheme } from "@/hooks/useTheme";
import { getCommonScreenOptions } from "@/navigation/screenOptions";

export type HomeStackParamList = {
  Upload: undefined;
  Preview: { resumeId: string };
  Pricing: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  const { theme, isDark } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        ...getCommonScreenOptions({ theme, isDark }),
      }}
    >
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Resume Improver" />,
        }}
      />
      <Stack.Screen
        name="Preview"
        component={PreviewScreen}
        options={{ 
          headerTitle: "Improved Resume",
          headerTransparent: false,
        }}
      />
      <Stack.Screen
        name="Pricing"
        component={PricingScreen}
        options={{ 
          headerTitle: "Get Credits",
          presentation: "modal",
        }}
      />
    </Stack.Navigator>
  );
}
