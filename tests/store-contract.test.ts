import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { z } from "zod";
import { resultSchema } from "../shared/contracts";

test("strict OpenAI output schema has required fields and no extra properties", () => {
  const schema = z.toJSONSchema(resultSchema);
  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(
    schema.required?.sort(),
    Object.keys(schema.properties || {}).sort(),
  );
});
test("no provider secret variable or provider endpoint in client source", () => {
  for (const file of [
    "lib/api.ts",
    "lib/use-analysis.ts",
    "app/health.tsx",
    "app/behavior.tsx",
    "app/emotion.tsx",
  ]) {
    assert.doesNotMatch(
      readFileSync(file, "utf8"),
      /EXPO_PUBLIC_OPENAI_API_KEY|api\.openai\.com/,
    );
  }
});
