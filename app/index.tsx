import { useState } from "react";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePet } from "../lib/store";
import { defaultApiUrl, getApiUrl } from "../lib/api";
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
  s,
} from "../components/ui";

export default function HomeScreen() {
  const { profile, history, apiUrl, setApiUrl, clear, token, setToken } =
    usePet();
  const [selected, setSelected] = useState<string | null>(null);
  const [settings, setSettings] = useState(false);
  const [status, setStatus] = useState("");
  const [checking, setChecking] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const record = history.find((r) => r.id === selected);
  async function check() {
    setChecking(true);
    setStatus("");
    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), 8000);
    try {
      const response = await fetch(`${getApiUrl(apiUrl)}/api/status`, {
        signal: abort.signal,
      });
      if (!response.ok)
        throw new Error("The server did not respond successfully.");
      const data = await response.json();
      setStatus(
        data.configured
          ? "Connected · AI service is configured."
          : "Connected · the server needs an OPENAI_API_KEY.",
      );
    } catch (e) {
      setStatus(
        e instanceof Error && e.name !== "AbortError"
          ? `Connection failed: ${e.message}`
          : "Connection timed out. Check that the API server is running.",
      );
    } finally {
      clearTimeout(timer);
      setChecking(false);
    }
  }
  async function clearData() {
    try {
      await clear();
      setSelected(null);
      setConfirmClear(false);
      setStatus("Local pet data cleared.");
    } catch {
      setStatus("Could not clear local data. Please try again.");
    }
  }
  return (
    <Page>
      <Header
        title="How can we help your pet today?"
        subtitle="Choose a feature to better understand pet health and well-being."
      />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Health Assessment"
        onPress={() => router.push("/health")}
        style={({ pressed }) => [
          home.healthCard,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Image
          source={require("../assets/images/health-card.png")}
          style={home.healthImage}
        />
        <View style={{ maxWidth: "68%" }}>
          <Text style={home.healthTitle}>Health Assessment</Text>
          <Text style={home.description}>
            Check symptoms, urgency, next steps, and diet guidance.
          </Text>
        </View>
      </Pressable>
      <View style={home.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Behavior Analysis"
          onPress={() => router.push("/behavior")}
          style={({ pressed }) => [
            home.smallCard,
            { backgroundColor: "#E7CBFC", opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Image
            source={require("../assets/images/behavior-card.png")}
            style={home.smallImage}
          />
          <Text style={home.smallTitle}>Behavior Analysis</Text>
          <Text style={home.smallDescription}>
            Analyze visible pet behaviors from photos.
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Emotion Assessment"
          onPress={() => router.push("/emotion")}
          style={({ pressed }) => [
            home.smallCard,
            { backgroundColor: "#B0F3F1", opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Image
            source={require("../assets/images/emotion-card.png")}
            style={home.smallImage}
          />
          <Text style={home.smallTitle}>Emotion Assessment</Text>
          <Text style={home.smallDescription}>
            Explore possible anxiety, fear, discomfort, or excitement.
          </Text>
        </Pressable>
      </View>
      <SafetyNote />
      <Card>
        <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
          <View
            style={{
              backgroundColor: "#EFF0FF",
              padding: 15,
              borderRadius: 20,
            }}
          >
            <Ionicons name="paw" size={26} color="#5966CD" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heading}>
              {profile.name || "Your pet’s care space"}
            </Text>
            <Body>
              {profile.petType
                ? `${profile.petType === "Other" ? profile.species || "Other species" : profile.petType} · ${profile.age || "—"} ${profile.ageUnit} · ${profile.weight || "—"} ${profile.weightUnit}`
                : "Start by adding a pet profile in Health."}
            </Body>
          </View>
        </View>
        <Button
          title={profile.petType ? "Edit pet profile" : "Create pet profile"}
          secondary
          onPress={() => router.push("/health")}
        />
      </Card>
      <Card title="Recent assessments">
        <Body>
          Up to 10 results saved on this device. Past assessments describe
          earlier observations, not your pet’s current condition.
        </Body>
        {history.length === 0 && (
          <Notice>Your completed assessments will appear here.</Notice>
        )}
        {history.map((entry) => (
          <Pressable
            key={entry.id}
            accessibilityRole="button"
            onPress={() => setSelected(selected === entry.id ? null : entry.id)}
            style={{
              borderTopWidth: 1,
              borderColor: "#E5E9F4",
              paddingVertical: 15,
              marginTop: 8,
              gap: 5,
            }}
          >
            <Text style={s.label}>
              {entry.petName} ·{" "}
              {entry.kind === "summary"
                ? "Health & emotion summary"
                : entry.kind === "health"
                  ? "Health assessment"
                  : entry.kind === "emotion"
                    ? "Emotion assessment"
                    : "Behavior analysis"}
            </Text>
            <Body>
              {new Date(entry.date).toLocaleString()} · {entry.result.urgency}{" "}
              urgency
            </Body>
            <Text style={{ color: "#5966CD" }}>
              {selected === entry.id ? "Close result ↑" : "View saved result →"}
            </Text>
          </Pressable>
        ))}
      </Card>
      {record && (
        <>
          <Notice>
            Saved assessment from {new Date(record.date).toLocaleString()}. This
            is historical, not a new analysis. Photo files are not saved with
            this record.
          </Notice>
          <AssessmentResult
            result={record.result}
            title={`${record.petName} · saved ${record.kind} assessment`}
          />
        </>
      )}
      <Button
        title={
          settings
            ? "Close connection & privacy settings"
            : "Connection & privacy settings"
        }
        secondary
        onPress={() => setSettings(!settings)}
      />
      {settings && (
        <Card title="Connection & privacy">
          <Body>
            Your profile, symptom notes and recent results are stored locally.
            Photos and the server access token are not saved. Analysis sends
            your submitted information to OpenAI through the API server.
          </Body>
          <Field
            label="API server URL (optional override)"
            value={apiUrl}
            onChangeText={setApiUrl}
            placeholder={defaultApiUrl()}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <Field
            label="Server access token (if required)"
            value={token}
            onChangeText={setToken}
            placeholder="For a protected server; kept only this session"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            title={checking ? "Checking connection…" : "Test connection"}
            disabled={checking}
            loading={checking}
            onPress={check}
          />
          {!!status && <Notice>{status}</Notice>}
          <Button
            title="Clear local pet data"
            secondary
            onPress={() => setConfirmClear(true)}
          />
          {confirmClear && (
            <Notice>
              <Text>
                This removes your saved profile, notes, photos and assessment
                history from this device.
              </Text>
            </Notice>
          )}
          {confirmClear && (
            <>
              <Button title="Yes, clear my local data" onPress={clearData} />
              <Button
                title="Keep my data"
                secondary
                onPress={() => setConfirmClear(false)}
              />
            </>
          )}
        </Card>
      )}
    </Page>
  );
}

const home = StyleSheet.create({
  healthCard: {
    backgroundColor: "#D0D7FF",
    borderRadius: 24,
    minHeight: 190,
    padding: 20,
    marginBottom: 14,
    overflow: "hidden",
  },
  healthImage: {
    position: "absolute",
    bottom: -100,
    right: -50,
    height: 280,
    width: 280,
    opacity: 0.9,
    resizeMode: "contain",
  },
  healthTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  description: { fontSize: 14, lineHeight: 20, color: "#536079" },
  row: { flexDirection: "row", gap: 12, marginBottom: 18 },
  smallCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 210,
    padding: 16,
    paddingBottom: 118,
    borderRadius: 22,
    overflow: "hidden",
  },
  smallTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  smallDescription: { fontSize: 12, lineHeight: 17, color: "#536079" },
  smallImage: {
    position: "absolute",
    bottom: -12,
    right: -12,
    height: 140,
    width: 128,
    opacity: 0.82,
    resizeMode: "contain",
  },
});
