import { Image, Pressable, Text, View } from "react-native";
import {
  emergencyOptions,
  type PetCase,
  type Profile,
} from "../shared/contracts";
import { usePet } from "../lib/store";
import { useAnalysis } from "../lib/use-analysis";
import {
  Body,
  Button,
  Card,
  Choices,
  Field,
  Header,
  Notice,
  Page,
  SafetyNote,
  s,
} from "../components/ui";
import { AssessmentResult } from "../components/results";

export default function HealthScreen() {
  const {
    profile: p,
    petCase: c,
    updateProfile,
    updateCase,
    health,
  } = usePet();
  const { run, loading, error, cancel } = useAnalysis("health");
  return (
    <Page>
      <Header
        title="Tell us about your pet"
        subtitle="A little context helps us guide your next step. Your profile is saved on this device."
      />
      <Image
        source={require("../assets/images/pet-header.png")}
        accessibilityLabel="Pet health illustration"
        style={{
          height: 145,
          width: "100%",
          borderRadius: 24,
          marginBottom: 20,
        }}
      />
      <SafetyNote />
      <Card title="01  ·  Pet profile">
        <Body>
          Required fields are marked *. Updating details clears the current
          assessments; saved history stays available.
        </Body>
        <Field
          label="Pet name"
          placeholder="What do you call your pet?"
          value={p.name}
          maxLength={40}
          onChangeText={(name) => updateProfile({ name })}
        />
        <Choices
          label="Pet type *"
          options={["Dog", "Cat", "Other"]}
          value={p.petType}
          onChange={(petType) =>
            updateProfile({ petType: petType as Profile["petType"] })
          }
        />
        {p.petType === "Other" && (
          <Field
            label="Species *"
            placeholder="e.g. Rabbit"
            value={p.species}
            maxLength={60}
            onChangeText={(species) => updateProfile({ species })}
          />
        )}
        <Field
          label="Age *"
          value={p.age}
          placeholder="e.g. 4 or 0.5"
          keyboardType="decimal-pad"
          maxLength={8}
          onChangeText={(age) => updateProfile({ age })}
        />
        <Choices
          label="Age unit"
          options={["years", "months"]}
          value={p.ageUnit}
          onChange={(ageUnit) =>
            updateProfile({ ageUnit: ageUnit as Profile["ageUnit"] })
          }
        />
        <Field
          label="Weight *"
          value={p.weight}
          placeholder="e.g. 22"
          keyboardType="decimal-pad"
          maxLength={8}
          onChangeText={(weight) => updateProfile({ weight })}
        />
        <Choices
          label="Weight unit"
          options={["lbs", "kg"]}
          value={p.weightUnit}
          onChange={(weightUnit) =>
            updateProfile({ weightUnit: weightUnit as Profile["weightUnit"] })
          }
        />
        <Field
          label="Breed (optional)"
          value={p.breed}
          maxLength={80}
          onChangeText={(breed) => updateProfile({ breed })}
          placeholder="e.g. Golden Retriever"
        />
        <Field
          label="Existing conditions / medication (optional)"
          value={p.conditions}
          onChangeText={(conditions) => updateProfile({ conditions })}
          placeholder="Include anything your veterinarian has diagnosed"
          multiline
        />
        <Field
          label="Food allergies or restrictions (optional)"
          value={p.allergies}
          maxLength={400}
          onChangeText={(allergies) => updateProfile({ allergies })}
          placeholder="e.g. Chicken allergy"
        />
      </Card>
      <Card title="02  ·  Symptoms">
        <Field
          label="Symptom description *"
          multiline
          maxLength={2000}
          value={c.symptoms}
          onChangeText={(symptoms) => updateCase({ symptoms })}
          placeholder="What changed? Include appetite, energy, and frequency. Write ‘no symptoms noticed’ if assessing behavior only."
        />
        <Field
          label="When did it start? *"
          value={c.startTime}
          maxLength={200}
          onChangeText={(startTime) => updateCase({ startTime })}
          placeholder="e.g. Yesterday morning, or no change noticed"
        />
      </Card>
      <Card title="03  ·  Recent changes">
        {(
          [
            ["foodChange", "Food change"],
            ["activityChange", "Activity change"],
            ["environmentChange", "Environment change"],
          ] as const
        ).map(([key, label]) => (
          <Choices
            key={key}
            label={label}
            value={c[key]}
            options={["Yes", "No", "Unsure"]}
            onChange={(value) =>
              updateCase({ [key]: value as PetCase["foodChange"] })
            }
          />
        ))}
      </Card>
      <Card title="Any urgent signs right now?" tint="#FFF7F8">
        <Body>
          Select any that apply. This list is not exhaustive. If you are worried
          about an emergency, call a veterinarian immediately.
        </Body>
        <View style={{ gap: 8, marginTop: 14 }}>
          {emergencyOptions.map(([id, label]) => (
            <Pressable
              key={id}
              accessibilityRole="checkbox"
              aria-checked={c.emergencySigns.includes(id)}
              onPress={() =>
                updateCase({
                  emergencySigns: c.emergencySigns.includes(id)
                    ? c.emergencySigns.filter((s) => s !== id)
                    : [...c.emergencySigns, id],
                })
              }
              style={{
                minHeight: 46,
                padding: 12,
                borderRadius: 12,
                backgroundColor: c.emergencySigns.includes(id)
                  ? "#F6CCD5"
                  : "#fff",
              }}
            >
              <Text style={s.label}>
                {c.emergencySigns.includes(id) ? "☑" : "□"} {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>
      <SafetyNote />
      <Body>
        By analyzing, you send these pet details to our server and OpenAI. Avoid
        personal information.
      </Body>
      <Button
        title={
          loading
            ? "Analyzing your pet’s health…"
            : health
              ? "Analyze health again"
              : "Analyze pet health"
        }
        loading={loading}
        disabled={loading}
        onPress={run}
      />
      {loading && <Button title="Cancel analysis" secondary onPress={cancel} />}
      {!!error && <Notice danger>{error}</Notice>}
      {!loading && health && (
        <AssessmentResult
          result={health}
          title={`${p.name || "Your pet"}’s health assessment`}
        />
      )}
    </Page>
  );
}
