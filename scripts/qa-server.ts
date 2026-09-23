// Deliberately isolated from the real server. Used only to verify UI without provider credentials.
import { createApp } from "../server/index";
import { result } from "../tests/fixtures";
import type { AnalysisRequest } from "../shared/contracts";
const fakeFetch = (async (_url: unknown, init: RequestInit) => {
  const body = JSON.parse(String(init.body));
  const input: AnalysisRequest = JSON.parse(body.input[0].content[0].text);
  const sample = {
    ...result,
    summary:
      "TEST FIXTURE — no live AI analysis was performed. This example verifies that result cards and history render correctly.",
    limitations: [
      "TEST FIXTURE: prewritten sample content, not an assessment of the submitted pet or photos.",
      "No physical examination.",
    ],
    emotions: ["summary", "emotion"].includes(input.kind)
      ? [
          {
            state: "Example: possible uncertainty",
            confidence: 0.4,
            explanation:
              "Test fixture only. A live summary would explain evidence and missing context here.",
          },
        ]
      : [],
    behaviorTags:
      input.kind === "behavior"
        ? [
            {
              tag: "Example observation",
              confidence: 0.5,
              evidence:
                "Test fixture only; these photos have not been analyzed.",
              photoNumbers: [1],
            },
          ]
        : [],
  };
  await new Promise((resolve) => setTimeout(resolve, 300));
  return new Response(
    JSON.stringify({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(sample) }],
        },
      ],
    }),
  );
}) as typeof fetch;
createApp({
  apiKey: "qa-fixture-not-a-provider-key",
  fetchImpl: fakeFetch,
}).listen(8788, "127.0.0.1", () =>
  console.log(
    "UI TEST FIXTURE server on http://localhost:8788 — no OpenAI calls.",
  ),
);
