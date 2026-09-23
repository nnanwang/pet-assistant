import { optionalProfileSchema, profileSchema } from "../shared/contracts";

// Include valid known fields without inventing zero ages/weights for blanks.
export function optionalProfile(draft: Record<string, unknown>) {
  const known: Record<string, unknown> = {};
  for (const [key, schema] of Object.entries(profileSchema.shape)) {
    const raw = draft[key];
    if (
      raw === undefined ||
      raw === null ||
      (typeof raw === "string" && !raw.trim())
    )
      continue;
    const value = key === "age" || key === "weight" ? Number(raw) : raw;
    const parsed = schema.safeParse(value);
    if (parsed.success) known[key] = parsed.data;
  }
  if (!("age" in known)) delete known.ageUnit;
  if (!("weight" in known)) delete known.weightUnit;
  return Object.keys(known).length ? optionalProfileSchema.parse(known) : null;
}
