import { router } from "expo-router";
import { usePet } from "../lib/store";
import { optionalProfile } from "../lib/optional-profile";
import { Body, Button, Card } from "./ui";

export function OptionalProfile() {
  const { profile } = usePet();
  const known = optionalProfile(profile);
  const facts = known
    ? [
        known.name,
        known.petType === "Other"
          ? known.species || "Other species"
          : known.petType,
        known.age !== undefined ? `${known.age} ${known.ageUnit}` : null,
        known.weight !== undefined
          ? `${known.weight} ${known.weightUnit}`
          : null,
        known.breed,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  return (
    <Card title="Pet profile · optional">
      <Body>
        {known
          ? "Using the details you’ve entered in Health. You can analyze even if the profile is incomplete."
          : "No profile needed. Start below with your photos or observations."}
      </Body>
      {!!facts && <Body>{facts}</Body>}
      {!!known?.conditions && (
        <Body>Existing conditions: {known.conditions}</Body>
      )}
      {!!known?.allergies && <Body>Allergies: {known.allergies}</Body>}
      <Button
        title={
          known ? "Edit optional pet details" : "Add pet details (optional)"
        }
        secondary
        onPress={() => router.push("/health")}
      />
    </Card>
  );
}
