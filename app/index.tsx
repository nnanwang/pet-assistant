// Import router so this page can move to another Expo Router screen.
import { router } from "expo-router";

// Import the React Native building blocks used on this page.
import {
  // Image displays local picture files.
  Image,

  // Pressable creates tappable cards and buttons.
  Pressable,

  // ScrollView lets the page scroll on smaller phone screens.
  ScrollView,

  // StyleSheet keeps all visual styles organized at the bottom.
  StyleSheet,

  // Text displays words on the screen.
  Text,

  // View is a basic layout container.
  View,
} from "react-native";

// Import the local image used in the large Health card.
// @ts-expect-error This beginner project does not have PNG type declarations yet.
import healthImage from "../assets/images/health-card.png";

// Import the local image used in the Behavior card.
// @ts-expect-error This beginner project does not have PNG type declarations yet.
import behaviorImage from "../assets/images/behavior-card.png";

// Import the local image used in the Emotion card.
// @ts-expect-error This beginner project does not have PNG type declarations yet.
import emotionImage from "../assets/images/emotion-card.png";

// This component is the Home route because this file is app/index.tsx.
export default function HomeScreen() {
  // The return statement describes what should appear on the phone screen.
  return (
    // ScrollView makes the whole Home page scrollable.
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top text area for the Home page. */}
      <View style={styles.homeHeader}>
        {/* Small app name text. */}
        <Text style={styles.kicker}>Pet Health Assistant</Text>

        {/* Main Home page question. */}
        <Text style={styles.homeTitle}>How can we help your pet today?</Text>

        {/* Short supporting sentence under the title. */}
        <Text style={styles.homeSubtitle}>
          Choose a feature to better understand pet health and well-being.
        </Text>
      </View>

      {/* Large clickable card that opens the Health page. */}
      <Pressable
        style={styles.featureCard}
        onPress={() => router.push("/health")}
      >
        {/* Decorative background image for the Health card. */}
        <Image source={healthImage} style={styles.featureBackgroundImage} />

        {/* Text content is placed above the background image. */}
        <View style={styles.featureCardText}>
          {/* Health card title. */}
          <Text style={styles.featureTitle}>Health Assessment</Text>

          {/* Health card description. */}
          <Text style={styles.featureDescription}>
            Check symptoms, urgency, next steps, and diet guidance.
          </Text>
        </View>
      </Pressable>

      {/* Row that holds the two smaller feature cards. */}
      <View style={styles.smallCardRow}>
        {/* Small clickable card that opens the Behavior page. */}
        <Pressable
          style={[styles.smallCard, styles.behaviorCard]}
          onPress={() => router.push("/behavior")}
        >
          {/* Decorative background image for the Behavior card. */}
          <Image source={behaviorImage} style={styles.smallCardImage} />

          {/* Behavior card title. */}
          <Text style={styles.smallCardTitle}>Behavior Analysis</Text>

          {/* Behavior card description. */}
          <Text style={styles.smallCardDescription}>
            Analyze visible pet behaviors from photos.
          </Text>

          {/* Label showing this feature is not built yet. */}
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </Pressable>

        {/* Small clickable card that opens the Emotion page. */}
        <Pressable
          style={[styles.smallCard, styles.emotionCard]}
          onPress={() => router.push("/emotion")}
        >
          {/* Decorative background image for the Emotion card. */}
          <Image source={emotionImage} style={styles.smallCardImage} />

          {/* Emotion card title. */}
          <Text style={styles.smallCardTitle}>Emotion Assessment</Text>

          {/* Emotion card description. */}
          <Text style={styles.smallCardDescription}>
            Explore possible anxiety, fear, discomfort, or excitement.
          </Text>

          {/* Label showing this feature is not built yet. */}
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </Pressable>
      </View>

      {/* Small safety note at the bottom of the Home page. */}
      <View style={styles.safetyNote}>
        {/* Safety note text. */}
        <Text style={styles.safetyText}>
          For urgent symptoms such as difficulty breathing, collapse, seizures,
          or uncontrolled bleeding, contact a veterinarian immediately.
        </Text>
      </View>
    </ScrollView>
  );
}

// StyleSheet stores all styles for this Home page.
const styles = StyleSheet.create({
  // Main page background and spacing.
  container: {
    backgroundColor: "#EEF3FF",
    padding: 20,
    paddingBottom: 40,
  },

  // Header spacing.
  homeHeader: {
    marginBottom: 18,
  },

  // Small purple app label.
  kicker: {
    color: "#7D8CFF",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 70,
  },

  // Large Home page title.
  homeTitle: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },

  // Subtitle under the title.
  homeSubtitle: {
    color: "#667085",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },

  // Large Health card.
  featureCard: {
    backgroundColor: "#d0d7ff",
    borderRadius: 24,
    marginBottom: 14,
    minHeight: 190,
    overflow: "hidden",
    padding: 20,
  },

  // Text area inside the large card.
  featureCardText: {
    maxWidth: "62%",
    zIndex: 2,
  },

  // Large card title.
  featureTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
  },

  // Large card description.
  featureDescription: {
    color: "#667085",
    fontSize: 14,
    lineHeight: 20,
  },

  // Large background image inside the Health card.
  featureBackgroundImage: {
    bottom: -100,
    height: 280,
    opacity: 0.9,
    position: "absolute",
    resizeMode: "contain",
    right: -50,
    width: 280,
  },

  // Horizontal row for the two small cards.
  smallCardRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  // Shared layout for Behavior and Emotion cards.
  smallCard: {
    borderRadius: 22,
    flex: 1,
    minHeight: 210,
    overflow: "hidden",
    padding: 16,
  },

  // Behavior card background color.
  behaviorCard: {
    backgroundColor: "#e7cbfc",
  },

  // Emotion card background color.
  emotionCard: {
    backgroundColor: "#b0f3f1",
  },

  // Small card title.
  smallCardTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
    zIndex: 2,
  },

  // Small card description.
  smallCardDescription: {
    color: "#667085",
    fontSize: 12,
    lineHeight: 17,
    zIndex: 2,
  },

  // Coming Soon label.
  comingSoon: {
    color: "#7D8CFF",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 8,
    textTransform: "uppercase",
    zIndex: 2,
  },

  // Background image inside each small card.
  smallCardImage: {
    bottom: -12,
    height: 140,
    opacity: 0.82,
    position: "absolute",
    resizeMode: "contain",
    right: -12,
    width: 128,
  },

  // Bottom safety note spacing.
  safetyNote: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  // Safety note text.
  safetyText: {
    color: "#667085",
    fontSize: 13,
    lineHeight: 19,
  },
});