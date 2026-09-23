import { z } from "zod";

const text = z.string().trim().min(1).max(1200);
const items = z.array(text).min(1).max(8);
export const profileSchema = z
  .object({
    name: z.string().trim().max(40),
    petType: z.enum(["Dog", "Cat", "Other"]),
    species: z.string().trim().max(60),
    age: z.number().finite().min(0).max(150),
    ageUnit: z.enum(["years", "months"]),
    weight: z.number().finite().positive().max(1500),
    weightUnit: z.enum(["lbs", "kg"]),
    breed: z.string().trim().max(80),
    conditions: z.string().trim().max(600),
    allergies: z.string().trim().max(400),
  })
  .refine((p) => p.petType !== "Other" || p.species.length > 0, {
    message: "Please specify the species.",
    path: ["species"],
  });
export const caseSchema = z.object({
  symptoms: z
    .string()
    .trim()
    .min(8, "Describe symptoms in at least 8 characters.")
    .max(2000),
  startTime: z.string().trim().min(1, "Tell us when this started.").max(200),
  foodChange: z.enum(["Yes", "No", "Unsure"]),
  activityChange: z.enum(["Yes", "No", "Unsure"]),
  environmentChange: z.enum(["Yes", "No", "Unsure"]),
  emergencySigns: z
    .array(
      z.enum([
        "breathing",
        "collapse",
        "seizure",
        "bleeding",
        "poison",
        "urination",
      ]),
    )
    .max(6),
});
export const resultSchema = z.object({
  summary: text,
  urgency: z.enum(["Low", "Medium", "High"]),
  possibleCauses: items,
  nextSteps: items,
  redFlags: items,
  dietRecommendation: z.object({
    recommendedFoods: items,
    foodsToAvoid: items,
    feedingFrequency: text,
    hydrationGuidance: text,
  }),
  behaviorTags: z
    .array(
      z.object({
        tag: text,
        confidence: z.number().min(0).max(1),
        evidence: text,
        photoNumbers: z.array(z.number().int().min(1).max(8)).max(8),
      }),
    )
    .max(8),
  emotions: z
    .array(
      z.object({
        state: text,
        confidence: z.number().min(0).max(1),
        explanation: text,
      }),
    )
    .max(6),
  calmingGuidance: items,
  environmentAdjustments: items,
  limitations: items,
});
export const optionalProfileSchema = z.object(profileSchema.shape).partial();
export const observationCaseSchema = caseSchema.extend({
  symptoms: z.string().trim().max(2000),
  startTime: z.string().trim().max(200),
});
const requestFields = z.object({
  context: z.string().trim().max(2000),
  images: z
    .array(
      z
        .string()
        .max(1_500_000)
        .regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/),
    )
    .max(8),
  healthResult: resultSchema.nullable(),
  behaviorResult: resultSchema.nullable(),
});
export const requestSchema = z
  .discriminatedUnion("kind", [
    requestFields.extend({
      kind: z.literal("health"),
      profile: profileSchema,
      case: caseSchema,
    }),
    requestFields.extend({
      kind: z.literal("behavior"),
      profile: optionalProfileSchema.nullable(),
      case: observationCaseSchema,
    }),
    requestFields.extend({
      kind: z.literal("emotion"),
      profile: optionalProfileSchema.nullable(),
      case: observationCaseSchema,
    }),
    requestFields.extend({
      kind: z.literal("summary"),
      profile: optionalProfileSchema.nullable(),
      case: observationCaseSchema,
    }),
  ])
  .superRefine((r, ctx) => {
    if (r.kind === "behavior" && r.images.length < 1)
      ctx.addIssue({
        code: "custom",
        message: "Add at least 1 photo for behavior analysis.",
      });
    if (!["behavior", "emotion"].includes(r.kind) && r.images.length)
      ctx.addIssue({
        code: "custom",
        message: "Photos are only accepted for behavior or emotion analysis.",
      });
    if (r.kind === "emotion" && !r.images.length && r.context.length < 8)
      ctx.addIssue({
        code: "custom",
        message:
          "Add a photo or describe your pet’s behavior in at least 8 characters.",
      });
    if (r.kind === "summary" && !r.healthResult && !r.behaviorResult)
      ctx.addIssue({
        code: "custom",
        message: "Complete a health or behavior assessment first.",
      });
  });
export type Profile = z.infer<typeof profileSchema>;
export type PetCase = z.infer<typeof caseSchema>;
export type Result = z.infer<typeof resultSchema>;
export type AnalysisRequest = z.infer<typeof requestSchema>;
export type Kind = AnalysisRequest["kind"];
export type RecordEntry = {
  id: string;
  date: string;
  kind: Kind;
  petName: string;
  result: Result;
};
export const DISCLAIMER =
  "Educational guidance only, not a veterinary diagnosis. AI can be wrong and photos cannot rule out illness. A veterinarian should assess persistent, worsening, or concerning symptoms. No medication or prescription dosing is provided.";
export const EMERGENCY_MESSAGE =
  "Contact an emergency veterinarian now. Do not wait for an AI result or try a diet change first.";
export const emergencyOptions = [
  ["breathing", "Trouble breathing"],
  ["collapse", "Collapse / unresponsive"],
  ["seizure", "Seizure"],
  ["bleeding", "Uncontrolled bleeding"],
  ["poison", "Possible poisoning"],
  ["urination", "Unable to urinate"],
] as const;
