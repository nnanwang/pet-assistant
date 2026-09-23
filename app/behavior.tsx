import { PhotoInput } from "../components/photo-input";
import { OptionalProfile } from "../components/optional-profile";
import { router } from "expo-router";
import { usePet } from "../lib/store";
import { useAnalysis } from "../lib/use-analysis";
import { AssessmentResult } from "../components/results";
import {
  Body,
  Button,
  Card,
  Field,
  Header,
  Notice,
  Page,
  SafetyNote,
} from "../components/ui";

export default function BehaviorScreen() {
  const { photos, updatePhotos, context, updateContext, behavior } = usePet();
  const { run, loading, error, cancel } = useAnalysis("behavior");
  return (
    <Page>
      <Header
        title="See the little signals"
        kicker="BEHAVIOR ANALYSIS"
        subtitle="Bring 1–8 photos. Add context if you like. We’ll help you understand what might be visible."
      />
      <SafetyNote />
      <OptionalProfile />
      <PhotoInput
        photos={photos}
        updatePhotos={updatePhotos}
        loading={loading}
        required
      />
      <Card title="What’s happening?">
        <Field
          label="Behavior context (optional)"
          multiline
          maxLength={2000}
          value={context}
          onChangeText={updateContext}
          placeholder="When does this happen? What triggers it? Describe the environment, changes in routine, and what happened before and after the photos."
        />
        <Notice>
          Still photos cannot confirm limping, scratching frequency, breathing
          rate, or a pet’s feelings. AI will distinguish visible evidence from
          what you describe.
        </Notice>
      </Card>
      <Body>
        By analyzing, you send the selected photos, any saved pet profile and
        symptoms, and context to our server and OpenAI.
      </Body>
      <Button
        title={loading ? "Looking at the photos…" : "Analyze behavior"}
        disabled={loading}
        loading={loading}
        onPress={run}
      />
      {loading && <Button title="Cancel analysis" secondary onPress={cancel} />}
      {!!error && <Notice danger>{error}</Notice>}
      {!loading && behavior && (
        <>
          <AssessmentResult
            result={behavior}
            title="Behavior & visual evidence"
          />
          <Button
            title="Explore possible emotions →"
            onPress={() => router.push("/emotion")}
          />
        </>
      )}
    </Page>
  );
}
