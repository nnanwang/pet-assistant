import type { AnalysisRequest, Result } from "../shared/contracts";

export const request: AnalysisRequest = {
  kind: "health",
  profile: {
    name: "Test pet",
    petType: "Dog",
    species: "",
    age: 4,
    ageUnit: "years",
    weight: 22,
    weightUnit: "lbs",
    breed: "",
    conditions: "",
    allergies: "Chicken",
  },
  case: {
    symptoms: "Scratching occasionally after a walk",
    startTime: "Yesterday",
    foodChange: "No",
    activityChange: "No",
    environmentChange: "Unsure",
    emergencySigns: [],
  },
  context: "",
  images: [],
  healthResult: null,
  behaviorResult: null,
};
export const result: Result = {
  summary:
    "Mild irritation is one possibility; a photo cannot establish a diagnosis.",
  urgency: "Low",
  possibleCauses: ["Possible environmental irritation"],
  nextSteps: ["Contact your vet if symptoms persist."],
  redFlags: ["Trouble breathing or collapse."],
  dietRecommendation: {
    recommendedFoods: ["Usual complete food compatible with known allergies."],
    foodsToAvoid: ["Known allergens."],
    feedingFrequency: "Keep the usual veterinarian-advised routine.",
    hydrationGuidance: "Provide access to fresh water.",
  },
  behaviorTags: [],
  emotions: [],
  calmingGuidance: ["Allow quiet rest."],
  environmentAdjustments: ["Provide a comfortable resting area."],
  limitations: ["No physical examination."],
};
