import { useEffect, useRef, useState } from "react";
import { profileSchema, requestSchema, type Kind } from "../shared/contracts";
import { optionalProfile } from "./optional-profile";
import { analyzePet } from "./api";
import { usePet } from "./store";

export function useAnalysis(kind: Kind) {
  const store = usePet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function run() {
    if (controller.current) return;
    setError("");
    const p = store.profile;
    const profile =
      kind === "health"
        ? profileSchema.safeParse({
            ...p,
            age: p.age.trim() ? Number(p.age) : NaN,
            weight: p.weight.trim() ? Number(p.weight) : NaN,
          })
        : { success: true as const, data: optionalProfile(p) };
    if (!profile.success) {
      setError(
        profile.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("\n"),
      );
      return;
    }
    const parsed = requestSchema.safeParse({
      kind,
      profile: profile.data,
      case: store.petCase,
      context: kind === "emotion" ? store.emotionContext : store.context,
      images: (kind === "behavior"
        ? store.photos
        : kind === "emotion"
          ? store.emotionPhotos
          : []
      ).map((p) => p.data),
      healthResult: kind === "summary" ? store.health : null,
      behaviorResult: kind === "summary" ? store.behavior : null,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join("\n"));
      return;
    }
    const version = store.revision.current;
    const abort = new AbortController();
    controller.current = abort;
    setLoading(true);
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      abort.abort();
    }, 55_000);
    try {
      const result = await analyzePet(
        parsed.data,
        store.apiUrl,
        store.token,
        abort.signal,
      );
      if (!abort.signal.aborted && !store.saveResult(kind, result, version))
        setError(
          "Details changed during analysis. Please analyze the updated information.",
        );
    } catch (e) {
      setError(
        abort.signal.aborted
          ? timedOut
            ? "Analysis timed out. Please try again."
            : "Analysis canceled. You can try again."
          : e instanceof TypeError
            ? "Cannot reach the server. Check your connection and the server URL in Home → Connection settings."
            : e instanceof Error
              ? e.message
              : "Analysis failed. Please try again.",
      );
    } finally {
      clearTimeout(timer);
      controller.current = null;
      setLoading(false);
    }
  }
  return { run, loading, error, cancel: () => controller.current?.abort() };
}
