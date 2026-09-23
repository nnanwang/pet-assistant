import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PetProvider } from "../lib/store";

export default function RootLayout() {
  const insets = useSafeAreaInsets();
  return (
    <PetProvider>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#5966CD",
          tabBarInactiveTintColor: "#687386",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#E4E7EC",
            paddingTop: 8,
            paddingBottom: Math.max(10, insets.bottom),
            height: 66 + insets.bottom,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="health"
          options={{
            title: "Health",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="behavior"
          options={{
            title: "Behavior",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="paw-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="emotion"
          options={{
            title: "Emotion",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="happy-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </PetProvider>
  );
}
