import test from "node:test";
import assert from "node:assert/strict";
import { optionalProfile } from "../lib/optional-profile";

test("optional profiles preserve known details and never convert missing numbers to zero", () => {
  assert.equal(
    optionalProfile({
      name: "",
      petType: "",
      age: "",
      weight: "",
      ageUnit: "years",
      weightUnit: "lbs",
    }),
    null,
  );
  assert.deepEqual(
    optionalProfile({
      name: "Milo",
      petType: "Cat",
      age: "",
      weight: "",
      ageUnit: "years",
      weightUnit: "lbs",
    }),
    { name: "Milo", petType: "Cat" },
  );
  assert.deepEqual(
    optionalProfile({
      age: "0",
      ageUnit: "months",
      weight: "2.5",
      weightUnit: "kg",
      allergies: "Chicken",
    }),
    {
      age: 0,
      ageUnit: "months",
      weight: 2.5,
      weightUnit: "kg",
      allergies: "Chicken",
    },
  );
  assert.equal(optionalProfile({ age: "invalid", weight: "-3" }), null);
  assert.equal(
    optionalProfile({ age: "  ", name: "  ", ageUnit: "years" }),
    null,
  );
});
