import { usePet } from "../lib/store";
import { useAnalysis } from "../lib/use-analysis";
import { AssessmentResult } from "../components/results";
import { OptionalProfile } from "../components/optional-profile";
import { PhotoInput } from "../components/photo-input";
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

export default function EmotionScreen() {
  const {
    health,
    behavior,
    summary,
    emotion,
    emotionContext,
    updateEmotionContext,
    emotionPhotos,
    updateEmotionPhotos,
  } = usePet();
  const { run, loading, error, cancel } = useAnalysis("emotion");
  const combined = useAnalysis("summary");
  return (
    <Page>
      <Header
        kicker="EMOTION ASSESSMENT"
        title="How might your pet feel?"
        subtitle="Share a photo or describe what you notice. No previous assessment needed."
      />
      <SafetyNote />
      <OptionalProfile />
      <PhotoInput
        photos={emotionPhotos}
        updatePhotos={updateEmotionPhotos}
        loading={loading}
      />
      <Card title="What are you noticing?">
        <Field
          label="Description (optional with a photo)"
          multiline
          maxLength={2000}
          value={emotionContext}
          onChangeText={updateEmotionContext}
          placeholder="For example: My dog hides when visitors arrive and relaxes after they leave. Describe posture, sounds, triggers, and changes in routine."
        />
        <Body>
          Add at least one photo or a description of 8 or more characters. You
          can also use both.
        </Body>
        <Notice>
          Emotions are possibilities, not confirmed feelings. Photos and
          descriptions cannot rule out pain or illness.
        </Notice>
      </Card>
      <Body>
        Analysis sends your photos, description, and any saved pet details and
        symptoms to our server and OpenAI.
      </Body>
      <Button
        title={loading ? "Exploring the signals…" : "Analyze emotion"}
        loading={loading}
        disabled={loading}
        onPress={run}
      />
      {loading && <Button title="Cancel analysis" secondary onPress={cancel} />}
      {!!error && <Notice danger>{error}</Notice>}
      {!loading && emotion && (
        <AssessmentResult
          result={emotion}
          title="Possible emotions & comfort guidance"
        />
      )}
      {(health || behavior) && (
        <Card title="Optional · combine your assessments">
          <Body>
            You also have a current Health or Behavior result. You can generate
            a separate combined health and emotion summary.
          </Body>
          <Button
            title="Generate combined summary"
            secondary
            loading={combined.loading}
            disabled={combined.loading || loading}
            onPress={combined.run}
          />
          {combined.loading && (
            <Button
              title="Cancel summary"
              secondary
              onPress={combined.cancel}
            />
          )}
          {!!combined.error && <Notice danger>{combined.error}</Notice>}
          {!combined.loading && summary && (
            <AssessmentResult
              result={summary}
              title="Combined health & emotion summary"
            />
          )}
        </Card>
      )}
    </Page>
  );
}
