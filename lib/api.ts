import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  resultSchema,
  type AnalysisRequest,
  type Result,
} from "../shared/contracts";

export function defaultApiUrl() {
  if (process.env.EXPO_PUBLIC_API_URL)
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  if (Platform.OS === "web" && typeof window !== "undefined")
    return `http://${window.location.hostname}:8787`;
  const host = Constants.expoConfig?.hostUri?.split(":")[0];
  return `http://${host || (Platform.OS === "android" ? "10.0.2.2" : "localhost")}:8787`;
}
export function getApiUrl(override: string) {
  const raw = override.trim() || defaultApiUrl();
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a valid server URL in Connection settings.");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error(
      "Use an http:// or https:// server URL without credentials or query parameters.",
    );
  if (!__DEV__ && url.protocol !== "https:")
    throw new Error("A secure HTTPS API URL is required for a release build.");
  return raw.replace(/\/$/, "");
}
export async function analyzePet(
  request: AnalysisRequest,
  override: string,
  token: string,
  signal: AbortSignal,
): Promise<Result> {
  const response = await fetch(`${getApiUrl(override)}/api/analyze`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}),
    },
    body: JSON.stringify(request),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The server returned an unreadable response. Check Connection settings.",
    );
  }
  if (!response.ok)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Analysis failed. Please try again.",
    );
  const parsed = resultSchema.safeParse(data.result);
  if (!parsed.success)
    throw new Error(
      "The server returned an incomplete result. Please try again.",
    );
  return parsed.data;
}
