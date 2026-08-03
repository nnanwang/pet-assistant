import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#7D8CFF",
        tabBarInactiveTintColor: "#98A2B3",

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E4E7EC",
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 10,
          height: 100,
        },

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          )
        }}
      />
      
      <Tabs.Screen
        name="health"
        options={{
          title: "Health",
          tabBarIcon: ({ color }) => (
            <Ionicons name="heart-outline" size={22} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="behavior"
        options={{
          title: "Behavior",
          tabBarIcon: ({ color }) => (
            <Ionicons name="paw-outline" size={22} color={color} />
          )
        }}
      />

      <Tabs.Screen
        name="emotion"
        options={{
          title: "Emotion",
          tabBarIcon: ({ color }) => (
            <Ionicons name="happy-outline" size={22} color={color} />
          )
        }}
      />
      
    </Tabs>
  );
}
