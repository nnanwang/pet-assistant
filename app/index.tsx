// Import useState from React.
// useState lets the screen remember values typed or selected by the user.
import { useState } from "react";

// Import basic React Native components used to build the screen UI.
import {
  // Image displays the decorative pet header image.
  Image,

  // Pressable creates clickable buttons.
  Pressable,

  // ScrollView allows the page to scroll when content is long.
  ScrollView,

  // StyleSheet stores all styles in one organized object.
  StyleSheet,

  // Text displays words on the screen.
  Text,

  // TextInput lets users type into form fields.
  TextInput,

  // View is a basic container for layout.
  View,
} from "react-native";

// Import a local image file from the assets folder.
// Expo can load local image files through import.
// @ts-expect-error This beginner project does not have PNG type declarations yet.
import petHeader from "../assets/images/pet-header.png";

type AIResult = {
  possibleCauses: string[];
  urgency: "Low" | "Medium" | "High";
  nextSteps: string[];
  redFlags: string[];
  disclaimer: string;
};

// This is the main screen component.
// Because this file is app/index.tsx, it becomes the home screen.
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
  // const [submittedData, setSubmittedData] = useState<object | null>(null);

  // Store the AI analysis result.
  const [aiResult, setAiResult] = useState<AIResult | null>(null);

  // Store whether the app is waiting for AI.
  const [loading, setLoading] = useState(false);

  // Store an API error message.
  const [apiError, setApiError] = useState("");

  async function analyzePetWithAI(formData: object): Promise<AIResult> {
    // Read the API key from the Expo environment variable.
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    // Stop if the API key is missing.
    if (!apiKey) {
      throw new Error("OpenAI API key is missing.");
    }

    // Convert the pet form data into a prompt for the AI.
    const prompt = `
  
    You are a cautious veterinary triage assistant.

    Analyze the following pet information:

    ${JSON.stringify(formData, null, 2)}

    Return ONLY valid JSON using exactly this structure:

    {
      "possibleCauses": ["string"],
      "urgency": "Low | Medium | High",
      "nextSteps": ["string"],
      "redFlags": ["string"],
      "disclaimer": "string"
    }

    Rules:
    - Do not give a definite diagnosis.
    - Use cautious language such as "possible" or "may be related to."
    - Do not provide medication dosages.
    - If there may be an emergency, set urgency to "High."
    - Keep the answer short and understandable.
    - The disclaimer must state that this is not a veterinary diagnosis.
    `;

    // Send the request to the OpenAI Responses API.
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        input: prompt,
      }),
    });

    // Check whether the request succeeded.
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI request failed: ${errorText}`);
    }

    // Convert the API response into a JavaScript object.
    const data = await response.json();

    // The Responses API returns generated text inside output.
    const outputText = data.output?.[0]?.content?.[0]?.text;

    // Stop if the AI returned no text.
    if (!outputText) {
      throw new Error("The AI returned an empty response.");
    }

    // Convert the returned JSON text into a JavaScript object.
    return JSON.parse(outputText);
  }

  async function handleSubmit() {
    // Create a new array for validation errors.
    const newErrors: string[] = [];

    // Convert age and weight into numbers.
    const ageNumber = Number(age);
    const weightNumber = Number(weight);

    // Check required fields.
    if (!petType) {
      newErrors.push("Please choose a pet type.");
    }

    if (!symptoms.trim()) {
      newErrors.push("Please describe the symptoms.");
    }

    // Validate optional numeric fields.
    if (age && (Number.isNaN(ageNumber) || ageNumber <= 0)) {
      newErrors.push("Age must be a positive number.");
    }

    if (weight && (Number.isNaN(weightNumber) || weightNumber <= 0)) {
      newErrors.push("Weight must be a positive number.");
    }

    // Show validation errors.
    setErrors(newErrors);

    // Stop if validation failed.
    if (newErrors.length > 0) {
      setAiResult(null);
      return;
    }

    // Organize the form data into one object.
    const formData = {
      petType,
      age,
      weight,
      breed,
      symptoms,
      startTime,
      foodChange,
      activityChange,
      environmentChange,
    };

    try {
      // Clear old errors and results.
      setApiError("");
      setAiResult(null);

      // Show loading state.
      setLoading(true);

      // Send form data to AI.
      const result = await analyzePetWithAI(formData);

      // Save AI result so the screen can display it.
      setAiResult(result);
    } catch (error) {
      // Show a friendly error message.
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to analyze the pet information.",
      );
    } finally {
      // Stop the loading state.
      setLoading(false);
    }
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
      <Pressable
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Analyzing..." : "Analyze Pet Health"}
        </Text>
      </Pressable>

      {/* Show submitted data only after successful validation */}
      {/* Show API error if the request fails */}
      {apiError !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{apiError}</Text>
        </View>
      )}

      {/* Show AI result after successful analysis */}
      {aiResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>AI Health Assessment</Text>

          <Text style={styles.resultLabel}>Urgency</Text>
          <Text style={styles.resultValue}>{aiResult.urgency}</Text>

          <Text style={styles.resultLabel}>Possible Causes</Text>
          {aiResult.possibleCauses.map((cause) => (
            <Text key={cause} style={styles.resultItem}>
              • {cause}
            </Text>
          ))}

          <Text style={styles.resultLabel}>Next Steps</Text>
          {aiResult.nextSteps.map((step) => (
            <Text key={step} style={styles.resultItem}>
              • {step}
            </Text>
          ))}

          <Text style={styles.resultLabel}>Red Flags</Text>
          {aiResult.redFlags.map((flag) => (
            <Text key={flag} style={styles.redFlagText}>
              • {flag}
            </Text>
          ))}

          <Text style={styles.disclaimer}>{aiResult.disclaimer}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// StyleSheet stores all visual styles for the screen.
const styles = StyleSheet.create({
  // Main page container
  container: {
    backgroundColor: "#EEF3FF",
    padding: 20,
    paddingBottom: 40,
  },

  // Top header card
  header: {
    backgroundColor: "#F8FAFF",
    borderRadius: 28,
    marginBottom: 18,
    padding: 24,
    shadowColor: "#8D9BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },

  // Decorative pet image
  headerImage: {
    borderRadius: 20,
    height: 120,
    marginBottom: 16,
    resizeMode: "cover",
    width: "100%",
  },

  // Small title text
  kicker: {
    color: "#6B7CFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },

  // Main title text
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },

  // Subtitle text
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

  // Normal pill text style
  pillText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "700",
  },

  // Selected pill text style
  selectedText: {
    color: "#FFFFFF",
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

  // Box that displays submitted data
  resultBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
  },

  // Submitted data title
  resultTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },

  // JSON result text
  resultText: {
    color: "#374151",
    fontFamily: "monospace",
    fontSize: 14,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },

  resultLabel: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
    marginTop: 16,
  },

  resultValue: {
    color: "#6B7CFF",
    fontSize: 18,
    fontWeight: "800",
  },

  resultItem: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },

  redFlagText: {
    color: "#B4234A",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 4,
  },

  disclaimer: {
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 18,
    padding: 14,
  },
});

