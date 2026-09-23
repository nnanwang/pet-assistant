# Verification report

## Automated validation

- Node test runner: 18 tests passed (including request/result contracts, image count and references, urgency floor, invalid output/refusal, credentials/quota/network/timeout, HTTP auth/CORS/rate limiting, cancel propagation, oversized bodies, production fail-closed behavior, and no provider secrets in client source).
- TypeScript: passed after excluding the existing `app-example` archive from the active app typecheck.
- ESLint: passed.
- Expo exports: Web static routes and iOS/Android Hermes bundles passed.
- iOS CocoaPods installation: passed. Unsigned Debug simulator build: **BUILD SUCCEEDED**, both arm64 and x86_64, using Xcode’s iOS 27 simulator SDK. The app was compiled/linked, not launched on a physical device.

Tests use a mock provider and do not establish model quality or clinical accuracy.

## Browser verification

Chrome checks completed with a fictional “Milo (demo)” profile:

- Home navigation and the four tabs render; profile is shared across Health/Behavior/Emotion.
- Empty form submission is rejected with an actionable message.
- Profile and draft fields survive reload; explicit age and weight units are shown.
- Selecting an urgent sign immediately shows emergency guidance without an AI response.
- A behavior request with no photos is rejected by the 1–8-photo/context requirement.
- Web file upload automation was blocked by the browser extension's file-access permission. The picker opens; successful real file selection and preview remain a manual acceptance item. A Cancel photo selection control was added for browsers that do not report picker cancellation.
- Independent, visibly labeled TEST FIXTURE server verified complete health/diet results, emotion summary, confidence display, missing-assessment state, and saved history. This was UI integration testing, **not** a live model-quality test. The page's server override was restored to the real API afterward.
- Editing the pet's age cleared current assessments and summary eligibility while keeping historical records.
- Radio controls now expose correct aria-checked values (verified from the browser DOM).
- Desktop, 820 × 1180 tablet, and 390 × 844 mobile viewports inspected visually; tab height/safe area improved. Browser sizing is not a physical-device test.
- Real provider call attempted: the existing key was rejected (authentication/access error). The app displayed the sanitized credentials error. Live text/vision accuracy and end-to-end live summary remain blocked until a valid key is provided.
- Exported web JavaScript checked programmatically: neither the actual local provider key nor the direct provider endpoint appears in the bundle.

## External acceptance still required

- Physical iOS/Android device permissions, successful photo selection and cancellation, and app lifecycle.
- Veterinary content review and actual user feedback.
- A narrated final demo recording with authorized pet photos.

Do not treat compilation, a browser viewport, or a script as proof of a physical-device test or a completed user study.

## Native build detail

The first Xcode build rejected dependency resource bundles declaring iOS 9.0/13.4. The Podfile post-install hook now raises lower dependency targets to Expo SDK 54's minimum iOS 15.1, without lowering higher targets. CocoaPods was regenerated and the full native build then passed.

Reproduce after installing pods:

```sh
xcodebuild -workspace ios/PetHealthAI.xcworkspace -scheme PetHealthAI \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/pet-assistant-xcode-build CODE_SIGNING_ALLOWED=NO build
```

The running preview is http://localhost:8082 and the real API is http://localhost:8787. The temporary mock service used for verification was stopped. Fictional, explicitly labeled sample records remain available in browser history for review. Updating `.env` while `npm run dev` is running restarts only the API process.


## Independent Behavior and Emotion update

- Health retains its required profile and symptom validation.
- Behavior accepts 1–8 photos with optional context and optional/partial profile.
- Emotion accepts photos, text (8+ characters), or both, without a profile or prior assessment.
- 21 automated tests pass, including blank/partial/full profile inputs, preserved Health requirements, image forwarding, and rejection of invented photo references in text-only Emotion.
- TypeScript and ESLint pass. Browser checks confirm the saved profile summary, no-profile entry screens, and an empty Emotion submission prompts only for a photo or description.
- Photo-only requests were verified with injected provider responses, not a live vision call. Physical-device image selection and live AI quality have not been reverified for this revision.
