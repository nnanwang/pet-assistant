import { useState } from "react";
import { Share, Text, View } from "react-native";
import { DISCLAIMER, type Result } from "../shared/contracts";
import { Body, Bullets, Button, Card, Notice, s } from "./ui";

export function AssessmentResult({
  result,
  title = "Your assessment",
}: {
  result: Result;
  title?: string;
}) {
  const [shareError, setShareError] = useState("");
  const actions = {
    Low: "Monitor closely; contact your vet if symptoms persist or worsen.",
    Medium: "Contact your veterinarian promptly for advice and an appointment.",
    High: "Seek emergency veterinary care now. Do not wait for another analysis.",
  };
  async function share() {
    const r = result;
    const message = [
      title,
      `Urgency: ${r.urgency}`,
      r.summary,
      "\nPossible causes",
      ...r.possibleCauses,
      "\nNext steps",
      ...r.nextSteps,
      "\nRed flags",
      ...r.redFlags,
      "\nDiet guidance",
      ...r.dietRecommendation.recommendedFoods,
      "Avoid:",
      ...r.dietRecommendation.foodsToAvoid,
      r.dietRecommendation.feedingFrequency,
      r.dietRecommendation.hydrationGuidance,
      "\nBehavior observations (uncalibrated AI confidence)",
      ...r.behaviorTags.map(
        (t) =>
          `${t.tag} (${Math.round(t.confidence * 100)}%): ${t.evidence} [Photos ${t.photoNumbers.join(", ")}]`,
      ),
      "\nPossible emotions (uncalibrated AI confidence)",
      ...r.emotions.map(
        (e) =>
          `${e.state} (${Math.round(e.confidence * 100)}%): ${e.explanation}`,
      ),
      "\nCalming guidance",
      ...r.calmingGuidance,
      "\nEnvironment",
      ...r.environmentAdjustments,
      "\nLimitations",
      ...r.limitations,
      DISCLAIMER,
    ].join("\n");
    try {
      if (
        typeof navigator !== "undefined" &&
        !navigator.share &&
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(message);
        setShareError(
          "Assessment copied. You can paste it into a message for your vet.",
        );
      } else {
        await Share.share({ title, message });
        setShareError("");
      }
    } catch {
      setShareError(
        "Sharing is unavailable. You can select and copy the result text.",
      );
    }
  }
  return (
    <View style={{ marginTop: 18 }}>
      <Text accessibilityRole="header" style={s.heading}>
        {title}
      </Text>
      <Card
        tint={
          result.urgency === "High"
            ? "#FFE7EC"
            : result.urgency === "Medium"
              ? "#FFF4D9"
              : "#E5F5EE"
        }
      >
        <Text style={s.heading}>{result.urgency} urgency</Text>
        <Body>{actions[result.urgency]}</Body>
      </Card>
      <Card title="What this may mean">
        <Text selectable style={s.body}>
          {result.summary}
        </Text>
      </Card>
      <Card title="Possible causes">
        <Bullets items={result.possibleCauses} />
      </Card>
      <Card title="What to do next">
        <Bullets items={result.nextSteps} />
      </Card>
      <Card title="Watch for these red flags" tint="#FFF1F4">
        <Bullets items={result.redFlags} />
      </Card>
      {result.behaviorTags.length > 0 && (
        <Card title="Visible behavior">
          <Body>
            Confidence is an AI estimate, not a measured probability. Still
            photos cannot confirm motion or repeated behavior.
          </Body>
          {result.behaviorTags.map((tag, i) => (
            <View key={i} style={{ marginTop: 18, gap: 6 }}>
              <Text style={s.label}>
                {tag.tag} · {Math.round(tag.confidence * 100)}% confidence
              </Text>
              <Body>{tag.evidence}</Body>
              <Text style={{ color: "#5966CD" }}>
                Photos {tag.photoNumbers.join(", ")}
              </Text>
            </View>
          ))}
        </Card>
      )}
      {result.emotions.length > 0 && (
        <Card title="Possible emotional state">
          <Body>
            These are possibilities, not confirmed feelings. Confidence is an
            uncalibrated AI estimate.
          </Body>
          {result.emotions.map((emotion, i) => (
            <View key={i} style={{ marginTop: 15, gap: 6 }}>
              <Text style={s.label}>
                {emotion.state} · {Math.round(emotion.confidence * 100)}%
              </Text>
              <Body>{emotion.explanation}</Body>
            </View>
          ))}
        </Card>
      )}
      <Card title="Diet & hydration">
        <Text style={[s.label, { marginBottom: 8 }]}>Foods to consider</Text>
        <Bullets items={result.dietRecommendation.recommendedFoods} />
        <View style={{ height: 16 }} />
        <Text style={[s.label, { marginBottom: 8 }]}>Foods to avoid</Text>
        <Bullets items={result.dietRecommendation.foodsToAvoid} />
        <View style={{ height: 16 }} />
        <Text style={s.label}>Feeding frequency</Text>
        <Body>{result.dietRecommendation.feedingFrequency}</Body>
        <View style={{ height: 16 }} />
        <Text style={s.label}>Hydration</Text>
        <Body>{result.dietRecommendation.hydrationGuidance}</Body>
      </Card>
      <Card title="Help your pet feel comfortable">
        <Bullets items={result.calmingGuidance} />
        <View style={{ height: 16 }} />
        <Text style={[s.label, { marginBottom: 8 }]}>
          Environment adjustments
        </Text>
        <Bullets items={result.environmentAdjustments} />
      </Card>
      <Card title="What this assessment cannot tell you">
        <Bullets items={result.limitations} />
      </Card>
      <Notice>{DISCLAIMER}</Notice>
      <Button title="Share with your veterinarian" secondary onPress={share} />
      {!!shareError && <Notice>{shareError}</Notice>}
    </View>
  );
}
