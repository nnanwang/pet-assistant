import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import petHeader from "../assets/images/pet-header.png";

export default function Index() {
  // Store the selected pet type: Dog, Cat, or Other.
  const [petType, setPetType] = useState("");

  // Store the pet's age typed by the user.
  const [age, setAge] = useState("");

  // Store the pet's weight typed by the user.
  const [weight, setWeight] = useState("");

  // Store the pet's breed typed by the user.
  const [breed, setBreed] = useState("");

  // Store the symptom description typed by the user.
  const [symptoms, setSymptoms] = useState("");

  // Store when the symptoms started.
  const [startTime, setStartTime] = useState("");

  // Store whether there was a recent food change.
  const [foodChange, setFoodChange] = useState("");

  // Store whether there was a recent activity change.
  const [activityChange, setActivityChange] = useState("");

  // Store whether there was a recent environment change.
  const [environmentChange, setEnvironmentChange] = useState("");

  // Store all error messages as an array of strings.
  const [errors, setErrors] = useState<string[]>([]);

  // Store the final submitted data.
  // Before submission, it is null.
  const [submittedData, setSubmittedData] = useState<object | null>(null);

  // This function runs when the user presses Continue.
  function handleSubmit() {
    // Create an empty list for new error messages.
    const newErrors: string[] = [];

    // Convert age text into a number.
    const ageNumber = Number(age);

    // Convert weight text into a number.
    const weightNumber = Number(weight);

    // Check if pet type is missing.
    if (!petType) {
      // Add an error message if pet type is empty.
      newErrors.push("Please choose a pet type.");
    }

    // Check if symptom description is missing.
    // trim() removes extra spaces.
    if (!symptoms.trim()) {
      // Add an error message if symptoms are empty.
      newErrors.push("Please describe the symptoms.");
    }

    // Age is optional.
    // But if the user enters age, it must be a positive number.
    if (age && (Number.isNaN(ageNumber) || ageNumber <= 0)) {
      // Add an error if age is not valid.
      newErrors.push("Age must be a positive number.");
    }

    // Weight is optional.
    // But if the user enters weight, it must be a positive number.
    if (weight && (Number.isNaN(weightNumber) || weightNumber <= 0)) {
      // Add an error if weight is not valid.
      newErrors.push("Weight must be a positive number.");
    }

    // Save the error list into state so the screen can display it.
    setErrors(newErrors);

    // If there is at least one error, stop the function.
    if (newErrors.length > 0) {
      // Clear previous submitted data.
      setSubmittedData(null);

      // Stop here and do not continue.
      return;
    }

    // If validation passes, save all collected form data.
    // For now, we display it on the same screen instead of navigating.
    setSubmittedData({
      petType,
      age,
      weight,
      breed,
      symptoms,
      startTime,
      foodChange,
      activityChange,
      environmentChange,
    });
  }

  // Return the UI that appears on the phone screen.
  return (
    // ScrollView makes the whole form scrollable.
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header section */}
      <View style={styles.header}>
        {/* Decorative image at the top of the screen */}
        <Image source={petHeader} style={styles.headerImage} />

        {/* Small app label */}
        <Text style={styles.kicker}>Pet Health Assistant</Text>

        {/* Main screen title */}
        <Text style={styles.title}>Tell us about your pet</Text>

        {/* Short description under the title */}
        <Text style={styles.subtitle}>
          Share a few quick details so we can understand what is going on.
        </Text>
      </View>

      {/* Pet Information card */}
      <View style={styles.card}>
        {/* Section title */}
        <Text style={styles.sectionTitle}>Pet Information</Text>

        {/* Pet type label */}
        <Text style={styles.label}>Pet Type *</Text>

        {/* Button row for pet type options */}
        <View style={styles.buttonRow}>
          {/* Create one button for each pet type */}
          {["Dog", "Cat", "Other"].map((type) => (
            // Pressable makes each option clickable.
            <Pressable
              // key helps React track list items.
              key={type}
              // Apply normal button style.
              // If this type is selected, also apply selected style.
              style={[
                styles.pillButton,
                petType === type && styles.selectedButton,
              ]}
              // When pressed, update petType.
              onPress={() => setPetType(type)}
            >
              {/* Button text */}
              <Text
                // Apply normal text style.
                // If selected, also apply selected text style.
                style={[
                  styles.pillText,
                  petType === type && styles.selectedText,
                ]}
              >
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Age label */}
        <Text style={styles.label}>Age</Text>

        {/* Age input field */}
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Example: 4"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />

        {/* Weight label */}
        <Text style={styles.label}>Weight (lbs)</Text>

        {/* Weight input field */}
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Example: 22"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />

        {/* Breed label */}
        <Text style={styles.label}>Breed (optional)</Text>

        {/* Breed input field */}
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Example: Golden Retriever"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Symptoms card */}
      <View style={styles.card}>
        {/* Section title */}
        <Text style={styles.sectionTitle}>Symptoms</Text>

        {/* Symptom description label */}
        <Text style={styles.label}>Symptom Description *</Text>

        {/* Multiline symptom input */}
        <TextInput
          style={[styles.input, styles.textArea]}
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="Example: Coughing and low energy"
          placeholderTextColor="#9CA3AF"
          multiline
        />

        {/* Start time label */}
        <Text style={styles.label}>When did it start?</Text>

        {/* Start time input */}
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="Example: Yesterday morning"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Context card */}
      <View style={styles.card}>
        {/* Section title */}
        <Text style={styles.sectionTitle}>Context</Text>

        {/* Food change label */}
        <Text style={styles.label}>Recent food change</Text>

        {/* Food change buttons */}
        <View style={styles.buttonRow}>
          {["Yes", "No", "Unsure"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.pillButton,
                foodChange === option && styles.selectedButton,
              ]}
              onPress={() => setFoodChange(option)}
            >
              <Text
                style={[
                  styles.pillText,
                  foodChange === option && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Activity change label */}
        <Text style={styles.label}>Activity change</Text>

        {/* Activity change buttons */}
        <View style={styles.buttonRow}>
          {["Yes", "No", "Unsure"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.pillButton,
                activityChange === option && styles.selectedButton,
              ]}
              onPress={() => setActivityChange(option)}
            >
              <Text
                style={[
                  styles.pillText,
                  activityChange === option && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Environment change label */}
        <Text style={styles.label}>Environment change</Text>

        {/* Environment change buttons */}
        <View style={styles.buttonRow}>
          {["Yes", "No", "Unsure"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.pillButton,
                environmentChange === option && styles.selectedButton,
              ]}
              onPress={() => setEnvironmentChange(option)}
            >
              <Text
                style={[
                  styles.pillText,
                  environmentChange === option && styles.selectedText,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Show error box only when there are errors */}
      {errors.length > 0 && (
        <View style={styles.errorBox}>
          {/* Show each error message */}
          {errors.map((error) => (
            <Text key={error} style={styles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      )}

      {/* Continue button */}
      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Continue</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // main page container
  container: {
    backgroundColor: "#EEF3FF",
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    backgroundColor: "#ffffff",
    borderRadius: 28,
    padding: 24,
    marginBottom: 18,
    shadowColor: "#8D9BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 3,
  },
  headerImage: {
    borderRadius: 20,
    height: 120,
    marginBottom: 16,
    resizeMode: "cover",
    width: "100%",
  },

  kicker: {
    color: "#6B7CFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  title: {
    color: " black",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  // White rounded content cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    marginBottom: 18,
    padding: 20,
    shadowColor: "#8D9BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 2,
  },

  // Section title inside each card
  sectionTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },

  // Input label text
  label: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
  },

  // Text input style
  input: {
    backgroundColor: "#F8FAFF",
    borderColor: "#E3E8FF",
    borderRadius: 18,
    borderWidth: 1,
    color: "#111827",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },

  // Extra style for longer text input
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  // Row layout for option buttons
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  // Normal pill button style
  pillButton: {
    backgroundColor: "#F8FAFF",
    borderColor: "#E3E8FF",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  // Selected pill button style
  selectedButton: {
    backgroundColor: "#7D8CFF",
    borderColor: "#7D8CFF",
  },
  // Error message container
  errorBox: {
    backgroundColor: "#FFF1F4",
    borderColor: "#FFD4DD",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },

  // Error message text
  errorText: {
    color: "#B4234A",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },

  // Continue button style
  submitButton: {
    alignItems: "center",
    backgroundColor: "#7D8CFF",
    borderRadius: 999,
    marginBottom: 20,
    padding: 17,
    shadowColor: "#6B7CFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 3,
  },

  // Continue button text
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});
