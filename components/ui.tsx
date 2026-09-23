import type { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EMERGENCY_MESSAGE } from "../shared/contracts";
import { usePet } from "../lib/store";

export const colors = {
  ink: "#20283F",
  muted: "#667085",
  purple: "#5966CD",
  bg: "#EEF3FF",
  border: "#DFE5F5",
};
export function Page({ children }: { children: ReactNode }) {
  const { ready, storageError } = usePet();
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.page}
        >
          <View style={s.inner}>
            {!ready ? (
              <ActivityIndicator accessibilityLabel="Loading saved pet data" />
            ) : (
              <>
                {!!storageError && <Notice danger>{storageError}</Notice>}
                {children}
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
export function Header({
  title,
  subtitle,
  kicker = "PET HEALTH ASSISTANT",
}: {
  title: string;
  subtitle: string;
  kicker?: string;
}) {
  return (
    <View style={{ gap: 9, marginVertical: 12, marginBottom: 24 }}>
      <Text style={s.kicker}>{kicker}</Text>
      <Text accessibilityRole="header" style={s.title}>
        {title}
      </Text>
      <Text style={s.body}>{subtitle}</Text>
    </View>
  );
}
export function Card({
  title,
  children,
  tint,
}: {
  title?: string;
  children: ReactNode;
  tint?: string;
}) {
  return (
    <View style={[s.card, tint ? { backgroundColor: tint } : undefined]}>
      {title && (
        <Text accessibilityRole="header" style={s.heading}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}
export function Body({ children }: { children: ReactNode }) {
  return <Text style={s.body}>{children}</Text>;
}
export function Button({
  title,
  onPress,
  disabled,
  secondary,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
  loading?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      aria-disabled={!!disabled}
      aria-busy={!!loading}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
      ]}
    >
      {loading && (
        <ActivityIndicator color={secondary ? colors.purple : "#fff"} />
      )}
      <Text style={[s.buttonText, secondary && { color: colors.purple }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 7, marginTop: 14 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#838DA3"
        maxLength={600}
        {...props}
        style={[
          s.input,
          props.multiline && { minHeight: 100, textAlignVertical: "top" },
          props.style,
        ]}
      />
    </View>
  );
}
export function Choices({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (s: string) => void;
}) {
  return (
    <View style={{ gap: 9, marginTop: 14 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.row}>
        {options.map((option) => (
          <Pressable
            key={option}
            accessibilityRole="radio"
            accessibilityLabel={`${label}: ${option}`}
            aria-checked={value === option}
            onPress={() => onChange(option)}
            style={[s.pill, value === option && s.selected]}
          >
            <Text
              style={{
                color: value === option ? "#fff" : colors.ink,
                fontWeight: "600",
              }}
            >
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function Notice({
  children,
  danger = false,
}: {
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        s.notice,
        danger && { backgroundColor: "#FFF0F2", borderColor: "#F5CCD3" },
      ]}
    >
      <Text style={[s.body, danger && { color: "#982D43" }]}>{children}</Text>
    </View>
  );
}
export function SafetyNote() {
  const { petCase } = usePet();
  return (
    <Notice danger={petCase.emergencySigns.length > 0}>
      {petCase.emergencySigns.length
        ? EMERGENCY_MESSAGE
        : "Educational guidance, not a diagnosis. For breathing trouble, collapse, or other urgent signs, contact a veterinarian immediately."}
    </Notice>
  );
}
export function Bullets({ items }: { items: string[] }) {
  return (
    <View style={{ gap: 8 }}>
      {items.map((item, i) => (
        <Text key={i} style={s.body}>
          • {item}
        </Text>
      ))}
    </View>
  );
}
export const s = StyleSheet.create({
  page: { padding: 20, paddingBottom: 36, flexGrow: 1 },
  inner: { width: "100%", maxWidth: 760, alignSelf: "center" },
  kicker: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.7,
    color: colors.purple,
  },
  title: { color: colors.ink, fontSize: 30, lineHeight: 37, fontWeight: "800" },
  heading: {
    color: colors.ink,
    fontWeight: "800",
    fontSize: 20,
    marginBottom: 12,
  },
  body: { fontSize: 15, lineHeight: 23, color: colors.muted },
  card: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#fff",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E4E9F5",
  },
  label: { fontSize: 14, color: colors.ink, fontWeight: "700" },
  input: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#F8FAFF",
    color: colors.ink,
    fontSize: 16,
    minHeight: 48,
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  pill: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    paddingVertical: 13,
    backgroundColor: "#F8FAFF",
  },
  selected: { backgroundColor: colors.purple, borderColor: colors.purple },
  button: {
    flexDirection: "row",
    gap: 10,
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.purple,
    borderRadius: 18,
    padding: 15,
    marginVertical: 7,
  },
  secondary: {
    backgroundColor: "#EBEEFF",
    borderWidth: 1,
    borderColor: "#D8DEFA",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  notice: {
    padding: 16,
    backgroundColor: "#F7F9FF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    marginVertical: 8,
  },
});
