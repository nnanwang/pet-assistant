import test from "node:test";
import assert from "node:assert/strict";
import { requestSchema, resultSchema } from "../shared/contracts";
import { analyze, enforceSafety, ServiceError } from "../server/analysis";
import { createApp } from "../server/index";
import type { AddressInfo } from "node:net";

import { request, result } from "./fixtures";

function provider(output: unknown = result): typeof fetch {
  return (async () =>
    new Response(
      JSON.stringify({
        status: "completed",
        output: [
          { type: "reasoning" },
          {
            type: "message",
            content: [{ type: "output_text", text: JSON.stringify(output) }],
          },
        ],
      }),
      { status: 200 },
    )) as typeof fetch;
}
function statusError(status: number) {
  return (error: unknown) =>
    error instanceof ServiceError && error.status === status;
}

test("valid request preserves units and allergy context", () =>
  assert.equal(requestSchema.parse(request).profile?.weightUnit, "lbs"));
test("rejects malformed numeric profile data and unspecified other species", () => {
  for (const weight of [-2, 0, NaN, Infinity])
    assert.equal(
      requestSchema.safeParse({
        ...request,
        profile: { ...request.profile, weight },
      }).success,
      false,
    );
  assert.equal(
    requestSchema.safeParse({
      ...request,
      profile: { ...request.profile, petType: "Other" },
    }).success,
    false,
  );
});
test("photo counts, image transport and behavior context are enforced", () => {
  for (const n of [0, 9])
    assert.equal(
      requestSchema.safeParse({
        ...request,
        kind: "behavior",
        context: "After a walk",
        images: Array(n).fill("data:image/jpeg;base64,YQ=="),
      }).success,
      false,
    );
  for (const n of [1, 2, 3, 8])
    assert.equal(
      requestSchema.safeParse({
        ...request,
        kind: "behavior",
        context: "After a walk",
        images: Array(n).fill("data:image/jpeg;base64,YQ=="),
      }).success,
      true,
    );
  assert.equal(
    requestSchema.safeParse({
      ...request,
      images: ["https://example.com/private.jpg"],
    }).success,
    false,
  );
});
test("summary requires a prior assessment and result requires complete diet", () => {
  assert.equal(
    requestSchema.safeParse({ ...request, kind: "summary" }).success,
    false,
  );
  assert.equal(
    resultSchema.safeParse({ ...result, dietRecommendation: {} }).success,
    false,
  );
  assert.equal(
    resultSchema.safeParse({ ...result, urgency: "Safe" }).success,
    false,
  );
});
test("confidence must be bounded and photo references positive integers", () => {
  assert.equal(
    resultSchema.safeParse({
      ...result,
      behaviorTags: [
        {
          tag: "panting",
          confidence: 1.1,
          evidence: "Mouth open",
          photoNumbers: [1],
        },
      ],
    }).success,
    false,
  );
  assert.equal(
    resultSchema.safeParse({
      ...result,
      behaviorTags: [
        {
          tag: "panting",
          confidence: 0.4,
          evidence: "Mouth open",
          photoNumbers: [0],
        },
      ],
    }).success,
    false,
  );
});
test("explicit emergency signs override a low AI result and replace diet guidance", () => {
  const actual = enforceSafety(result, {
    ...request,
    case: { ...request.case, emergencySigns: ["breathing"] },
  });
  assert.equal(actual.urgency, "High");
  assert.match(actual.nextSteps[0], /emergency veterinarian now/);
  assert.match(
    actual.dietRecommendation.feedingFrequency,
    /emergency veterinarian/,
  );
});
test("summary cannot lower the urgency of either prior assessment", () => {
  for (const urgency of ["Medium", "High"] as const)
    assert.equal(
      enforceSafety(result, {
        ...request,
        kind: "summary",
        healthResult: { ...result, urgency },
      }).urgency,
      urgency,
    );
});
test("parses text after non-message output items", async () =>
  assert.deepEqual(
    await analyze(request, { apiKey: "test", fetchImpl: provider() }),
    result,
  ));
test("keeps provider key only in authorization and sends numbered photos with all context", async () => {
  let body: any;
  let headers: any;
  const fetchImpl = (async (_url: unknown, init: RequestInit) => {
    body = JSON.parse(String(init.body));
    headers = init.headers;
    return provider()(String(_url), init);
  }) as typeof fetch;
  await analyze(
    {
      ...request,
      kind: "behavior",
      context: "After a long walk",
      images: Array(3).fill("data:image/jpeg;base64,YQ=="),
    },
    { apiKey: "test-secret", fetchImpl },
  );
  assert.equal(headers.Authorization, "Bearer test-secret");
  assert.equal(body.store, false);
  assert.equal(body.text.format.strict, true);
  assert.equal(
    body.input[0].content.filter((p: any) => p.type === "input_image").length,
    3,
  );
  assert.match(body.input[0].content[0].text, /Chicken/);
  assert.doesNotMatch(JSON.stringify(body), /test-secret/);
});
test("invalid output, missing fields, refusal, and incomplete output are handled", async () => {
  await assert.rejects(
    analyze(request, {
      apiKey: "test",
      fetchImpl: provider({ urgency: "Low" }),
    }),
    statusError(502),
  );
  for (const [body, code] of [
    [{ status: "incomplete" }, 502],
    [{ output: [{ content: [{ type: "refusal" }] }] }, 422],
  ] as const) {
    await assert.rejects(
      analyze(request, {
        apiKey: "test",
        fetchImpl: (async () =>
          new Response(JSON.stringify(body))) as typeof fetch,
      }),
      statusError(code),
    );
  }
});
test("rejects fabricated image references and health-only photo observations", async () => {
  const fake = {
    ...result,
    behaviorTags: [
      {
        tag: "Resting",
        evidence: "Lying down",
        confidence: 0.7,
        photoNumbers: [4],
      },
    ],
  };
  await assert.rejects(
    analyze(
      {
        ...request,
        kind: "behavior",
        context: "After a long walk",
        images: Array(3).fill("data:image/jpeg;base64,YQ=="),
      },
      { apiKey: "test", fetchImpl: provider(fake) },
    ),
    statusError(502),
  );
  await assert.rejects(
    analyze(request, { apiKey: "test", fetchImpl: provider(fake) }),
    statusError(502),
  );
});
test("missing key, upstream credentials, quota, network and timeout produce safe errors", async () => {
  await assert.rejects(analyze(request), statusError(503));
  for (const [upstream, expected] of [
    [401, 503],
    [403, 503],
    [429, 429],
    [500, 502],
  ])
    await assert.rejects(
      analyze(request, {
        apiKey: "test",
        fetchImpl: (async () =>
          new Response("secret provider details", {
            status: upstream,
          })) as typeof fetch,
      }),
      (error) =>
        statusError(expected)(error) &&
        !String(error).includes("secret provider"),
    );
  await assert.rejects(
    analyze(request, {
      apiKey: "test",
      fetchImpl: (async () => {
        throw new Error("network");
      }) as typeof fetch,
    }),
    statusError(502),
  );
  const stalled = ((_url: unknown, init: RequestInit) =>
    new Promise((_resolve, reject) =>
      init.signal?.addEventListener("abort", () => reject(new Error("abort"))),
    )) as typeof fetch;
  await assert.rejects(
    analyze(request, { apiKey: "test", fetchImpl: stalled, timeoutMs: 10 }),
    statusError(504),
  );
});
test("HTTP endpoint handles CORS, JSON, authorization, and rate limiting", async () => {
  const app = createApp({
    apiKey: "test",
    fetchImpl: provider(),
    production: true,
    token: "local-test",
  });
  await new Promise<void>((resolve) => app.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(app.address() as AddressInfo).port}`;
  try {
    const status = await fetch(url + "/api/status");
    assert.deepEqual(await status.json(), { configured: true });
    assert.equal(
      (
        await fetch(url + "/api/status", {
          headers: { Origin: "https://bad.example" },
        })
      ).status,
      403,
    );
    const preflight = await fetch(url + "/api/analyze", {
      method: "OPTIONS",
      headers: { Origin: "http://localhost:8082" },
    });
    assert.equal(preflight.status, 204);
    assert.equal(
      preflight.headers.get("Access-Control-Allow-Origin"),
      "http://localhost:8082",
    );
    assert.equal(
      (await fetch(url + "/api/analyze", { method: "POST" })).status,
      401,
    );
    const headers = {
      "Content-Type": "application/json",
      Authorization: "Bearer local-test",
    };
    assert.equal(
      (
        await fetch(url + "/api/analyze", {
          method: "POST",
          headers,
          body: "{broken",
        })
      ).status,
      400,
    );
    const response = await fetch(url + "/api/analyze", {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });
    assert.equal(response.status, 200);
    assert.deepEqual((await response.json()).result, result);
    for (let n = 0; n < 9; n++)
      await fetch(url + "/api/analyze", {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      });
    assert.equal(
      (
        await fetch(url + "/api/analyze", {
          method: "POST",
          headers,
          body: JSON.stringify(request),
        })
      ).status,
      429,
    );
  } finally {
    await new Promise<void>((resolve) => app.close(() => resolve()));
  }
});

test("cancel signal aborts the provider request without returning a result", async () => {
  const cancellation = new AbortController();
  let providerAborted = false;
  const pending = analyze(request, {
    apiKey: "test",
    signal: cancellation.signal,
    fetchImpl: ((_url: unknown, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () => {
          providerAborted = true;
          reject(new Error("aborted"));
        });
        cancellation.abort();
      })) as typeof fetch,
  });
  await assert.rejects(pending, statusError(499));
  assert.equal(providerAborted, true);
});

test("HTTP rejects oversized uploads without losing the error response", async () => {
  const app = createApp({ apiKey: "test", fetchImpl: provider() });
  await new Promise<void>((resolve) => app.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${(app.address() as AddressInfo).port}/api/analyze`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: ["x".repeat(13_000_000)] }),
    });
    assert.equal(response.status, 413);
    assert.match((await response.json()).error, /too large/);
  } finally {
    await new Promise<void>((resolve) => app.close(() => resolve()));
  }
});

test("production without access control fails closed", async () => {
  const app = createApp({
    apiKey: "test",
    production: true,
    fetchImpl: provider(),
  });
  await new Promise<void>((resolve) => app.listen(0, "127.0.0.1", resolve));
  try {
    const response = await fetch(
      `http://127.0.0.1:${(app.address() as AddressInfo).port}/api/analyze`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      },
    );
    assert.equal(response.status, 503);
  } finally {
    await new Promise<void>((resolve) => app.close(() => resolve()));
  }
});

test("standalone behavior and emotion accept no profile and no health symptoms", async () => {
  const blankCase = {
    ...request.case,
    symptoms: "",
    startTime: "",
    emergencySigns: [],
  };
  for (const input of [
    { kind: "behavior", images: ["data:image/jpeg;base64,YQ=="], context: "" },
    { kind: "emotion", images: [], context: "Hides when visitors arrive" },
    { kind: "emotion", images: ["data:image/jpeg;base64,YQ=="], context: "" },
  ]) {
    for (const profile of [
      null,
      { petType: "Cat", name: "Milo" },
      request.profile,
    ]) {
      const payload = { ...request, ...input, profile, case: blankCase };
      assert.equal(requestSchema.safeParse(payload).success, true);
      assert.equal(
        (await analyze(payload, { apiKey: "test", fetchImpl: provider() }))
          .urgency,
        "Low",
      );
    }
  }
  assert.equal(
    requestSchema.safeParse({ ...request, profile: null }).success,
    false,
  );
  assert.equal(
    requestSchema.safeParse({ ...request, case: blankCase }).success,
    false,
  );
  for (const context of ["", "   ", "short"]) {
    assert.equal(
      requestSchema.safeParse({
        ...request,
        kind: "emotion",
        profile: null,
        case: blankCase,
        context,
      }).success,
      false,
    );
  }
});

test("emotion photos reach the provider and unsupported visual claims are rejected", async () => {
  let body: any;
  const payload = {
    ...request,
    kind: "emotion",
    profile: null,
    images: ["data:image/jpeg;base64,YQ=="],
    context: "",
  };
  await analyze(payload, {
    apiKey: "test",
    fetchImpl: (async (url, init) => {
      body = JSON.parse(String(init?.body));
      return provider()(url, init);
    }) as typeof fetch,
  });
  assert.equal(
    body.input[0].content.filter((c: any) => c.type === "input_image").length,
    1,
  );
  assert.equal(JSON.parse(body.input[0].content[0].text).profile, null);
  const fabricated = {
    ...result,
    behaviorTags: [
      {
        tag: "Posture",
        confidence: 0.5,
        evidence: "Invented",
        photoNumbers: [2],
      },
    ],
  };
  await assert.rejects(
    analyze(payload, { apiKey: "test", fetchImpl: provider(fabricated) }),
    statusError(502),
  );
  await assert.rejects(
    analyze(
      { ...payload, images: [], context: "Hides when visitors arrive" },
      { apiKey: "test", fetchImpl: provider(fabricated) },
    ),
    statusError(502),
  );
});
