// useState lets this screen remember form values and request status.
import { useState } from "react";
// Import the React Native building blocks used by the Health interface.
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Import the local banner image displayed at the top of the screen.
// @ts-expect-error This beginner project does not have PNG type declarations yet.
import petHeader from "../assets/images/pet-header.png";

// Describe the exact result shape expected from the AI service.
type AIResult = {
  // Store cautious explanations that might account for the symptoms.
  possibleCauses: string[];
  // Restrict urgency to one of the three levels used by the interface.
  urgency: "Low" | "Medium" | "High";
  // Store practical actions the pet owner can take next.
  nextSteps: string[];
  // Store warning signs that require extra attention.
  redFlags: string[];
  // Store the required reminder that this is not a diagnosis.
  disclaimer: string;
  // Diet guidance is optional because the service may omit it.
  dietRecommendation?: {
    // List general foods that may be appropriate to consider.
    recommendedFoods: string[];
    // List foods the pet owner should avoid.
    foodsToAvoid: string[];
    // Explain how often the pet may need to be fed.
    feedingFrequency: string;
    // Explain general hydration guidance.
    hydrationGuidance: string;
  };
};

// This component becomes the Health route because its file is app/health.tsx.
export default function HealthScreen() {
  // Remember which pet-type button the user selected.
  const [petType, setPetType] = useState("");
  // Remember the age input as text while the user types.
  const [age, setAge] = useState("");
  // Remember the weight input as text while the user types.
  const [weight, setWeight] = useState("");
  // Remember the optional breed input.
  const [breed, setBreed] = useState("");
  // Remember the required symptom description.
  const [symptoms, setSymptoms] = useState("");
  // Remember the user's description of when symptoms started.
  const [startTime, setStartTime] = useState("");
  // Remember whether the pet's food recently changed.
  const [foodChange, setFoodChange] = useState("");
  // Remember whether the pet's activity recently changed.
  const [activityChange, setActivityChange] = useState("");
  // Remember whether the pet's environment recently changed.
  const [environmentChange, setEnvironmentChange] = useState("");

  // Store all form-validation messages that should be shown together.
  const [errors, setErrors] = useState<string[]>([]);
  // Store a successful AI result, or null before a result is available.
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  // Track whether a network request is currently running.
  const [loading, setLoading] = useState(false);
  // Store an API or parsing error separately from form errors.
  const [apiError, setApiError] = useState("");

  // Send the completed form to OpenAI and return structured result data.
  async function analyzePetWithAI(formData: object): Promise<AIResult> {
    // Read the public Expo environment variable bundled with the app.
    // Security note: EXPO_PUBLIC values are visible to users, so production
    // apps should call OpenAI through a secure server instead of exposing a key.
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    // Stop immediately when no API key has been configured.
    if (!apiKey) {
      throw new Error("OpenAI API key is missing.");
    }

    // Build instructions that request short, cautious veterinary-triage JSON.
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
      "dietRecommendation": {
        "recommendedFoods": ["string"],
        "foodsToAvoid": ["string"],
        "feedingFrequency": "string",
        "hydrationGuidance": "string"
      },
      "disclaimer": "string"
    }

    Rules:
    - Do not give a definite diagnosis.
    - Use cautious language such as "possible" or "may be related to."
    - Give only general food and hydration guidance.
    - Do not recommend medication or medication dosages.
    - Do not claim food can diagnose or cure a disease.
    - Do not provide a confirmed prescription diet.
    - Use cautious wording such as "consider," "may help," or "ask a veterinarian."
    - If urgency is High, prioritize immediate veterinary care over diet advice.
    - Do not replace professional veterinary advice.
    - If there may be an emergency, set urgency to "High."
    - Keep the answer short and understandable.
    - The disclaimer must state that this is not a veterinary diagnosis.
    `;

    // Wait for the Responses API to analyze the prompt.
    const response = await fetch("https://api.openai.com/v1/responses", {
      // POST sends new data to the service.
      method: "POST",
      // Tell the server that the request body is JSON and provide authentication.
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      // Convert the JavaScript request object into a JSON string.
      body: JSON.stringify({
        // Choose the OpenAI model that will process the request.
        model: "gpt-4.1",
        // Pass the complete instruction prompt as model input.
        input: prompt,
      }),
    });

    // Convert a non-success HTTP response into a readable JavaScript error.
    if (!response.ok) {
      // Read the server's error body to help explain what failed.
      const errorText = await response.text();
      throw new Error(`AI request failed: ${errorText}`);
    }

    // Parse the successful HTTP response from JSON into a JavaScript object.
    const data = await response.json();
    // Safely find the first text item in the Responses API output.
    const outputText = data.output?.[0]?.content?.[0]?.text;

    // Stop if the expected text field was missing or empty.
    if (!outputText) {
      throw new Error("The AI returned an empty response.");
    }

    // Convert the model's JSON text into the AIResult returned by this function.
    return JSON.parse(outputText);
  }

  // Validate and submit the form when the user presses the main button.
  async function handleSubmit() {
    // Start a fresh list of validation messages for this submission.
    const newErrors: string[] = [];
    // Convert age text to a number so it can be validated.
    const ageNumber = Number(age);
    // Convert weight text to a number so it can be validated.
    const weightNumber = Number(weight);

    // Require one of the pet-type choices.
    if (!petType) {
      newErrors.push("Please choose a pet type.");
    }

    // Reject a symptom description that is empty or only spaces.
    if (!symptoms.trim()) {
      newErrors.push("Please describe the symptoms.");
    }

    // When age is provided, require a valid number greater than zero.
    if (age && (Number.isNaN(ageNumber) || ageNumber <= 0)) {
      newErrors.push("Age must be a positive number.");
    }

    // When weight is provided, require a valid number greater than zero.
    if (weight && (Number.isNaN(weightNumber) || weightNumber <= 0)) {
      newErrors.push("Weight must be a positive number.");
    }

    // Update the screen with every validation error that was found.
    setErrors(newErrors);

    // Do not contact the AI service until the form passes validation.
    if (newErrors.length > 0) {
      // Remove any older result so it cannot be mistaken for the current form.
      setAiResult(null);
      // Exit handleSubmit early.
      return;
    }

    // Collect the separate state values into one object for the prompt.
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

    // Use try/catch/finally to manage success, errors, and loading cleanup.
    try {
      // Clear any error left over from an earlier request.
      setApiError("");
      // Clear any older result while the new analysis is loading.
      setAiResult(null);
      // Disable the button and show its loading label.
      setLoading(true);

      // Wait for the helper function to return an AI analysis.
      const result = await analyzePetWithAI(formData);
      // Save the result so React renders the results section.
      setAiResult(result);
    } catch (error) {
      // Show the real Error message, with a safe fallback for unknown values.
      setApiError(
        error instanceof Error
          ? error.message
          : "Unable to analyze the pet information.",
      );
    } finally {
      // Re-enable the button whether the request succeeded or failed.
      setLoading(false);
    }
  }

  // Describe everything that should appear on the Health screen.
  return (
    // Let the long form and its results scroll on smaller screens.
    <ScrollView contentContainerStyle={styles.container}>
      {/* Display the introductory banner at the top of the form. */}
      <View style={styles.header}>
        {/* Show the local pet banner image. */}
        <Image source={petHeader} style={styles.headerImage} />
        {/* Show the small product label above the main title. */}
        <Text style={styles.kicker}>Pet Health Assistant</Text>
        {/* Tell the user what to do on this page. */}
        <Text style={styles.title}>Tell us about your pet</Text>
        {/* Add a short explanation below the title. */}
        <Text style={styles.subtitle}>
          Share a few quick details so we can understand what is going on.
        </Text>
      </View>

      {/* Group basic pet details inside the first form card. */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Pet Information</Text>

        {/* The asterisk marks pet type as required. */}
        <Text style={styles.label}>Pet Type *</Text>
        {/* Place the pet-type choices in one wrapping row. */}
        <View style={styles.buttonRow}>
          {/* Create one button for every pet type in the array. */}
          {["Dog", "Cat", "Other"].map((type) => (
            <Pressable
              // Give React a stable identifier for this generated button.
              key={type}
              // Add the purple selected style only when this type is active.
              style={[
                styles.pillButton,
                petType === type && styles.selectedButton,
              ]}
              // Save this type when its button is pressed.
              onPress={() => setPetType(type)}
            >
              <Text
                // Turn the label white when its button is selected.
                style={[
                  styles.pillText,
                  petType === type && styles.selectedText,
                ]}
              >
                {/* Display the current array value as the button label. */}
                {type}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Connect the age field to the age state value. */}
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          placeholder="Example: 4"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />

        {/* Connect the weight field to the weight state value. */}
        <Text style={styles.label}>Weight (lbs)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="Example: 22"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />

        {/* Connect the optional breed field to the breed state value. */}
        <Text style={styles.label}>Breed (optional)</Text>
        <TextInput
          style={styles.input}
          value={breed}
          onChangeText={setBreed}
          placeholder="Example: Golden Retriever"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Group symptom details inside the second form card. */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Symptoms</Text>

        {/* Use a taller multiline input for the required symptom description. */}
        <Text style={styles.label}>Symptom Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="Example: Coughing and low energy"
          placeholderTextColor="#9CA3AF"
          multiline
        />

        {/* Let the user describe symptom timing in their own words. */}
        <Text style={styles.label}>When did it start?</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="Example: Yesterday morning"
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Group recent changes inside the Context card. */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Context</Text>

        {/* Ask whether the pet's food recently changed. */}
        <Text style={styles.label}>Recent food change</Text>
        <View style={styles.buttonRow}>
          {/* Create Yes, No, and Unsure buttons from one array. */}
          {["Yes", "No", "Unsure"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.pillButton,
                foodChange === option && styles.selectedButton,
              ]}
              // Save this answer when the user presses it.
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

        {/* Ask whether the pet's activity recently changed. */}
        <Text style={styles.label}>Activity change</Text>
        <View style={styles.buttonRow}>
          {/* Reuse the same three choices for activity. */}
          {["Yes", "No", "Unsure"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.pillButton,
                activityChange === option && styles.selectedButton,
              ]}
              // Save this answer when the user presses it.
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

        {/* Ask whether the pet's surroundings recently changed. */}
        <Text style={styles.label}>Environment change</Text>
        <View style={styles.buttonRow}>
          {/* Reuse the same three choices for environment. */}
          {["Yes", "No", "Unsure"].map((option) => (
            <Pressable
              key={option}
              style={[
                styles.pillButton,
                environmentChange === option && styles.selectedButton,
              ]}
              // Save this answer when the user presses it.
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

      {/* Render the validation box only when at least one form error exists. */}
      {errors.length > 0 && (
        <View style={styles.errorBox}>
          {/* Render every validation message on its own line. */}
          {errors.map((error) => (
            <Text key={error} style={styles.errorText}>
              {error}
            </Text>
          ))}
        </View>
      )}

      {/* Submit the form and visually disable the button during a request. */}
      <Pressable
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {/* Change the label so the user knows analysis is in progress. */}
          {loading ? "Analyzing..." : "Analyze Pet Health"}
        </Text>
      </Pressable>

      {/* Render a network or parsing error only when its message is nonempty. */}
      {apiError !== "" && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{apiError}</Text>
        </View>
      )}

      {/* Render the results section only after a successful response. */}
      {aiResult && (
        <View style={styles.resultsArea}>
          <Text style={styles.resultTitle}>AI Results</Text>

          {/* Color the urgency card according to the returned risk level. */}
          <View
            style={[
              styles.urgencyCard,
              aiResult.urgency === "Low" && styles.lowUrgencyCard,
              aiResult.urgency === "Medium" && styles.mediumUrgencyCard,
              aiResult.urgency === "High" && styles.highUrgencyCard,
            ]}
          >
            {/* Match the status-dot color to the same urgency level. */}
            <View
              style={[
                styles.statusDot,
                aiResult.urgency === "Low" && styles.lowStatusDot,
                aiResult.urgency === "Medium" && styles.mediumStatusDot,
                aiResult.urgency === "High" && styles.highStatusDot,
              ]}
            />
            <View>
              {/* Combine the returned level with the word "Risk". */}
              <Text style={styles.riskTitle}>{aiResult.urgency} Risk</Text>
              <Text style={styles.riskMessage}>
                {/* Choose one action message for the returned urgency. */}
                {aiResult.urgency === "Low" && "Monitor at home"}
                {aiResult.urgency === "Medium" &&
                  "Schedule veterinary care soon"}
                {aiResult.urgency === "High" &&
                  "Seek veterinary care immediately"}
              </Text>
            </View>
          </View>

          {/* List each possible cause returned by the service. */}
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Possible Causes</Text>
            {aiResult.possibleCauses.map((cause) => (
              <Text key={cause} style={styles.resultItem}>
                • {cause}
              </Text>
            ))}
          </View>

          {/* List each recommended next step returned by the service. */}
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Next Steps</Text>
            {aiResult.nextSteps.map((step) => (
              <Text key={step} style={styles.resultItem}>
                • {step}
              </Text>
            ))}
          </View>

          {/* List each warning sign using stronger red text. */}
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Red Flags</Text>
            {aiResult.redFlags.map((flag) => (
              <Text key={flag} style={styles.redFlagText}>
                • {flag}
              </Text>
            ))}
          </View>

          {/* Show Diet Recommendation only if the AI returned diet data. */}
          {aiResult.dietRecommendation && (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Diet Recommendation</Text>

              {/* Display foods that may be appropriate to consider. */}
              <View style={styles.recommendedFoodBox}>
                <Text style={styles.resultSubLabel}>Recommended Foods</Text>
                {aiResult.dietRecommendation.recommendedFoods.map((food) => (
                  <Text key={food} style={styles.resultItem}>
                    • {food}
                  </Text>
                ))}
              </View>

              {/* Display foods the owner should avoid. */}
              <View style={styles.avoidFoodBox}>
                <Text style={styles.resultSubLabel}>Foods to Avoid</Text>
                {aiResult.dietRecommendation.foodsToAvoid.map((food) => (
                  <Text key={food} style={styles.resultItem}>
                    • {food}
                  </Text>
                ))}
              </View>

              {/* Display the returned feeding-frequency guidance. */}
              <View style={styles.frequencyBox}>
                <Text style={styles.resultSubLabel}>Feeding Frequency</Text>
                <Text style={styles.resultItem}>
                  {aiResult.dietRecommendation.feedingFrequency}
                </Text>
              </View>

              {/* Display the returned hydration guidance. */}
              <View style={styles.hydrationBox}>
                <Text style={styles.resultSubLabel}>Hydration Guidance</Text>
                <Text style={styles.resultItem}>
                  {aiResult.dietRecommendation.hydrationGuidance}
                </Text>
              </View>
            </View>
          )}

          {/* Finish with the AI's required veterinary disclaimer. */}
          <Text style={styles.disclaimer}>{aiResult.disclaimer}</Text>
        </View>
      )}
    </ScrollView>
  );
}

// Keep all visual rules for the Health screen in one named object.
const styles = StyleSheet.create({
  // Set the page background and outer spacing.
  container: {
    backgroundColor: "#EEF3FF",
    padding: 20,
    paddingBottom: 40,
  },
  // Create the rounded introductory panel and its shadow.
  header: {
    backgroundColor: "#F8FAFF",
    borderRadius: 28,
    marginBottom: 18,
    marginTop: 50,
    padding: 24,
    shadowColor: "#8D9BFF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  // Size and round the banner image inside the header.
  headerImage: {
    borderRadius: 20,
    height: 120,
    marginBottom: 16,
    resizeMode: "cover",
    width: "100%",
  },
  // Style the small purple product label.
  kicker: {
    color: "#6B7CFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  // Style the main page heading.
  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
  },
  // Style the explanatory text below the heading.
  subtitle: {
    color: "#6B7280",
    fontSize: 16,
    lineHeight: 23,
    marginTop: 10,
  },
  // Create the shared rounded panels used for form sections.
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
  // Style headings such as Pet Information and Symptoms.
  sectionTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 14,
  },
  // Style the label above each form control.
  label: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    marginTop: 12,
  },
  // Create the shared appearance for text input fields.
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
  // Make the symptom field taller and begin its text at the top.
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  // Arrange choice buttons horizontally and wrap them when needed.
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  // Create the default unselected choice-button appearance.
  pillButton: {
    backgroundColor: "#F8FAFF",
    borderColor: "#E3E8FF",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  // Turn a selected choice button purple.
  selectedButton: {
    backgroundColor: "#7D8CFF",
    borderColor: "#7D8CFF",
  },
  // Style the default choice-button label.
  pillText: {
    color: "#6B7280",
    fontSize: 16,
    fontWeight: "700",
  },
  // Turn a selected choice-button label white.
  selectedText: {
    color: "#FFFFFF",
  },
  // Create the pink container shared by validation and API errors.
  errorBox: {
    backgroundColor: "#FFF1F4",
    borderColor: "#FFD4DD",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    padding: 14,
  },
  // Style each error message in dark red.
  errorText: {
    color: "#B4234A",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  // Create the large rounded purple submit button and its shadow.
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
  // Fade the submit button while it is disabled.
  submitButtonDisabled: {
    opacity: 0.6,
  },
  // Style the submit button's white label.
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  // Add a small gap before the complete results section.
  resultsArea: {
    marginTop: 4,
  },
  // Style the "AI Results" heading.
  resultTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 10,
  },
  // Arrange the urgency dot and text in a rounded horizontal card.
  urgencyCard: {
    alignItems: "center",
    borderRadius: 24,
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
    padding: 18,
  },
  // Use a green-tinted background for low urgency.
  lowUrgencyCard: {
    backgroundColor: "#ECFDF3",
  },
  // Use a yellow-tinted background for medium urgency.
  mediumUrgencyCard: {
    backgroundColor: "#FFF8E6",
  },
  // Use a red-tinted background for high urgency.
  highUrgencyCard: {
    backgroundColor: "#FFF1F2",
  },
  // Define the shared circular shape of the urgency indicator.
  statusDot: {
    borderRadius: 999,
    height: 14,
    width: 14,
  },
  // Color the low-urgency indicator green.
  lowStatusDot: {
    backgroundColor: "#22C55E",
  },
  // Color the medium-urgency indicator amber.
  mediumStatusDot: {
    backgroundColor: "#F59E0B",
  },
  // Color the high-urgency indicator red.
  highStatusDot: {
    backgroundColor: "#E11D48",
  },
  // Style the urgency level heading.
  riskTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },
  // Style the short action message below the urgency level.
  riskMessage: {
    color: "#6B7280",
    fontSize: 15,
    marginTop: 3,
  },
  // Create the shared white card used by each result category.
  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 14,
    padding: 18,
  },
  // Style each result category's main heading.
  resultLabel: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  // Style headings inside the diet recommendation card.
  resultSubLabel: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  // Style regular bullet items and guidance text.
  resultItem: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  // Emphasize warning-sign bullets with dark red text.
  redFlagText: {
    color: "#B4234A",
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
    marginBottom: 4,
  },
  // Use green to group recommended-food content.
  recommendedFoodBox: {
    backgroundColor: "#ECFDF3",
    borderRadius: 18,
    marginTop: 12,
    padding: 14,
  },
  // Use pink to group foods-to-avoid content.
  avoidFoodBox: {
    backgroundColor: "#FFF1F4",
    borderRadius: 18,
    marginTop: 12,
    padding: 14,
  },
  // Use light purple to group feeding-frequency content.
  frequencyBox: {
    backgroundColor: "#F1F4FF",
    borderRadius: 18,
    marginTop: 12,
    padding: 14,
  },
  // Use light blue to group hydration content.
  hydrationBox: {
    backgroundColor: "#EEF8FF",
    borderRadius: 18,
    marginTop: 12,
    padding: 14,
  },
  // Style the final safety disclaimer as muted supporting text.
  disclaimer: {
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    color: "#6B7280",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    padding: 14,
  },
});

