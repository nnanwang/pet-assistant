import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import {
  caseSchema,
  resultSchema,
  type PetCase,
  type Profile,
  type Kind,
  type RecordEntry,
  type Result,
} from "../shared/contracts";

export type ProfileDraft = Omit<Profile, "age" | "weight" | "petType"> & {
  age: string;
  weight: string;
  petType: "" | Profile["petType"];
};
export type Photo = { id: string; uri: string; data: string };
export const emptyProfile: ProfileDraft = {
  name: "",
  petType: "",
  species: "",
  age: "",
  ageUnit: "years",
  weight: "",
  weightUnit: "lbs",
  breed: "",
  conditions: "",
  allergies: "",
};
export const emptyCase: PetCase = {
  symptoms: "",
  startTime: "",
  foodChange: "Unsure",
  activityChange: "Unsure",
  environmentChange: "Unsure",
  emergencySigns: [],
};
type State = {
  profile: ProfileDraft;
  petCase: PetCase;
  context: string;
  photos: Photo[];
  health: Result | null;
  behavior: Result | null;
  summary: Result | null;
  emotion: Result | null;
  emotionContext: string;
  emotionPhotos: Photo[];
  history: RecordEntry[];
  apiUrl: string;
};
const initial: State = {
  profile: emptyProfile,
  petCase: emptyCase,
  context: "",
  photos: [],
  health: null,
  behavior: null,
  summary: null,
  emotion: null,
  emotionContext: "",
  emotionPhotos: [],
  history: [],
  apiUrl: "",
};
const KEY = "pet-assistant:v1";
const persistedSchema = z.object({
  profile: z.object({
    name: z.string(),
    petType: z.enum(["", "Dog", "Cat", "Other"]),
    species: z.string(),
    age: z.string(),
    ageUnit: z.enum(["years", "months"]),
    weight: z.string(),
    weightUnit: z.enum(["lbs", "kg"]),
    breed: z.string(),
    conditions: z.string(),
    allergies: z.string(),
  }),
  petCase: caseSchema.extend({
    symptoms: z.string().max(2000),
    startTime: z.string().max(200),
  }),
  context: z.string().max(2000),
  apiUrl: z.string(),
  history: z
    .array(
      z.object({
        id: z.string(),
        date: z.string(),
        kind: z.enum(["health", "behavior", "emotion", "summary"]),
        petName: z.string(),
        result: resultSchema,
      }),
    )
    .max(10),
});
type Store = State & {
  ready: boolean;
  storageError: string;
  token: string;
  setToken: (s: string) => void;
  updateProfile: (p: Partial<ProfileDraft>) => void;
  updateCase: (p: Partial<PetCase>) => void;
  updateContext: (s: string) => void;
  updatePhotos: (p: Photo[]) => void;
  updateEmotionContext: (s: string) => void;
  updateEmotionPhotos: (p: Photo[]) => void;
  setApiUrl: (s: string) => void;
  saveResult: (kind: Kind, result: Result, version: number) => boolean;
  revision: React.RefObject<number>;
  clear: () => Promise<void>;
};
const StoreContext = createContext<Store | null>(null);
export function PetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [token, setToken] = useState("");
  const revision = useRef(0);
  const writes = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = persistedSchema.safeParse(JSON.parse(raw));
        if (!parsed.success) throw new Error("invalid");
        setState({ ...initial, ...parsed.data });
      })
      .catch(() => {
        if (mounted)
          setStorageError(
            "Saved data could not be loaded. You can continue with a new profile.",
          );
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    // Raw photos and access tokens are deliberately never persisted.
    const { profile, petCase, context, history, apiUrl } = state;
    writes.current = writes.current
      .catch(() => {})
      .then(() =>
        AsyncStorage.setItem(
          KEY,
          JSON.stringify({ profile, petCase, context, history, apiUrl }),
        ),
      )
      .catch(() =>
        setStorageError(
          "Changes could not be saved on this device. Keep the app open or try clearing local data.",
        ),
      );
  }, [state, ready]);
  const updateProfile = useCallback((p: Partial<ProfileDraft>) => {
    revision.current++;
    setState((s) => ({
      ...s,
      profile: { ...s.profile, ...p },
      health: null,
      emotion: null,
      behavior: null,
      summary: null,
    }));
  }, []);
  const updateCase = useCallback((p: Partial<PetCase>) => {
    revision.current++;
    setState((s) => ({
      ...s,
      petCase: { ...s.petCase, ...p },
      health: null,
      emotion: null,
      behavior: null,
      summary: null,
    }));
  }, []);
  const updateContext = useCallback((context: string) => {
    revision.current++;
    setState((s) => ({ ...s, context, behavior: null, summary: null }));
  }, []);
  const updatePhotos = useCallback((photos: Photo[]) => {
    revision.current++;
    setState((s) => ({ ...s, photos, behavior: null, summary: null }));
  }, []);
  const updateEmotionContext = useCallback((emotionContext: string) => {
    revision.current++;
    setState((s) => ({ ...s, emotionContext, emotion: null }));
  }, []);
  const updateEmotionPhotos = useCallback((emotionPhotos: Photo[]) => {
    revision.current++;
    setState((s) => ({ ...s, emotionPhotos, emotion: null }));
  }, []);
  const setApiUrl = useCallback(
    (apiUrl: string) => setState((s) => ({ ...s, apiUrl })),
    [],
  );
  const saveResult = useCallback(
    (kind: Kind, result: Result, version: number) => {
      if (version !== revision.current) return false;
      revision.current++;
      setState((s) => ({
        ...s,
        [kind]: result,
        ...(kind !== "summary" ? { summary: null } : {}),
        history: [
          {
            id: `${Date.now()}-${Math.random()}`,
            date: new Date().toISOString(),
            kind,
            petName: s.profile.name || s.profile.petType || "Your pet",
            result,
          },
          ...s.history,
        ].slice(0, 10),
      }));
      return true;
    },
    [],
  );
  const clear = useCallback(async () => {
    revision.current++;
    setToken("");
    setState(initial);
    await writes.current;
    await AsyncStorage.removeItem(KEY);
    setStorageError("");
  }, []);
  return (
    <StoreContext.Provider
      value={{
        ...state,
        ready,
        storageError,
        token,
        setToken,
        revision,
        updateProfile,
        updateCase,
        updateContext,
        updatePhotos,
        updateEmotionContext,
        updateEmotionPhotos,
        setApiUrl,
        saveResult,
        clear,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}
export function usePet() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("PetProvider missing");
  return value;
}
