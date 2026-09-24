# 🐾 Pet Health Assistant

**A cross-platform AI assistant that helps pet owners organize symptoms, understand visible behavior, and explore possible emotional needs.**

Built with **React Native, Expo, TypeScript, Node.js, and the OpenAI Responses API**, Pet Health Assistant combines text and image inputs with structured assessments, reusable pet profiles, and local assessment history. It supports three distinct starting points: a symptom assessment, a photo-based behavior analysis, or an independent emotion assessment.

> **Project status:** Functional portfolio prototype with automated contract and API tests. Intended for educational guidance, not veterinary diagnosis. Live AI quality and physical-device acceptance testing remain separate validation work.

<a id="contents"></a>

## Contents

<ul>
  <li><a href="#app-preview">App preview</a></li>
  <li><a href="#overview">Overview</a></li>
  <li><a href="#features">Features</a></li>
  <li><a href="#user-flows">User flows</a></li>
  <li><a href="#architecture">Architecture</a></li>
  <li><a href="#getting-started">Getting started</a></li>
  <li><a href="#testing">Testing</a></li>
  <li><a href="#api-overview">API overview</a></li>
  <li><a href="#data-and-privacy">Data and privacy</a></li>
  <li><a href="#deployment-considerations">Deployment considerations</a></li>
  <li><a href="#limitations-and-future-work">Limitations and future work</a></li>
  <li><a href="#project-structure">Project structure</a></li>
  <li><a href="#supporting-documents">Supporting documents</a></li>
  <li><a href="#portfolio-highlights">Portfolio highlights</a></li>
</ul>

<a id="app-preview"></a>

## 📸 App preview

Real screenshots of the running app’s web interface at a portrait browser size. These show the entry screens, not native-device captures or AI-generated mockups. Click an image to view it at full size.

<table>
  <tr>
    <th>🏠 Home</th>
    <th>🩺 Health</th>
  </tr>
  <tr>
    <td><a href="docs/screenshots/home.png"><img src="docs/screenshots/home.png" width="300" alt="Home screen with Health, Behavior, and Emotion feature cards" /></a></td>
    <td><a href="docs/screenshots/health.png"><img src="docs/screenshots/health.png" width="300" alt="Health assessment screen with the required pet profile form" /></a></td>
  </tr>
  <tr>
    <td>Three ways to start, with a shared care space.</td>
    <td>Structured pet details and symptom intake.</td>
  </tr>
  <tr>
    <th>🐾 Behavior</th>
    <th>💛 Emotion</th>
  </tr>
  <tr>
    <td><a href="docs/screenshots/behavior.png"><img src="docs/screenshots/behavior.png" width="300" alt="Behavior analysis with optional pet profile and photo upload" /></a></td>
    <td><a href="docs/screenshots/emotion.png"><img src="docs/screenshots/emotion.png" width="300" alt="Independent emotion assessment with photo or text input" /></a></td>
  </tr>
  <tr>
    <td>Start with a photo; a profile is optional.</td>
    <td>Use photos, a description, or both.</td>
  </tr>
</table>

🎬 A narrated Expo Go walkthrough is planned. The [recording script](docs/DEMO.md) is available; a video has not been published yet.

[↑ Back to contents](#contents)

<a id="overview"></a>

## 💡 Overview

Pet owners often have observations rather than a clear question: a change in appetite, an unfamiliar posture, or a pet hiding after a change in routine. This project turns those observations into an organized assessment with possible explanations, urgency, practical next steps, and explicit limitations.

The application is designed around three principles:

- **Multiple ways to start.** Health uses a detailed intake, while Behavior and Emotion work without a completed pet profile or prior assessment.
- **Evidence-aware results.** Photo observations reference numbered images; possible emotions are presented as interpretations rather than confirmed feelings.
- **Clear boundaries.** Urgent-sign guidance appears immediately, API failures are visible, and demonstration data is explicitly labeled.

[↑ Back to contents](#contents)

<a id="features"></a>

## ✨ Features

<a id="health-assessment"></a>

### 🩺 Health assessment

A structured intake collects pet species, age, weight, symptoms, onset, and recent changes. Owners can add a name, breed, existing conditions, and allergies or food restrictions.

The assessment provides:

- Possible causes and a **Low / Medium / High** urgency level.
- Suggested next steps and signs to watch for.
- General food, feeding-frequency, and hydration guidance.
- An immediate emergency notice when an urgent sign is selected, before any AI request completes.

Health retains its required profile and symptom fields. Age and weight include explicit units, and other species require a species description.
<img width="300"  alt="ScreenRecording_09-24-202612-40-30_1-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/56310d5c-e276-43a3-9694-6e6c6ac39032" />

<a id="behavior-analysis"></a>

### 🐾 Behavior analysis

Upload **1–8 photos** of the same pet and episode to explore posture and visible behavior. Background information about triggers, surroundings, and recent events is optional.

- No completed Health assessment or pet profile required.
- Available profile details are automatically summarized and included.
- Add/remove controls and numbered image previews.
- JPEG conversion, compression, and resizing to a maximum long edge of 1,280 pixels before upload.
- Structured behavior tags, photo references, evidence explanations, and subjective AI confidence estimates.

Still photos are treated as limited observations; the application does not claim to measure movement, breathing rate, or repeated behavior from them.


<a id="emotion-assessment"></a>

### 💛 Emotion assessment

Start directly with **photos, a written description, or both**. With no photos, the description must contain at least eight characters.

- No prior Health or Behavior result required.
- Pet profiles are optional; existing details are automatically reused.
- Separate photo and description inputs from Behavior.
- Possible emotional states, supporting explanations, calming guidance, and environmental suggestions.
- Text-only assessments cannot return invented photo observations.

When a current Health or Behavior result exists, an **optional combined summary** can integrate those assessments. This is a separate action and does not block independent emotion analysis. Its urgency cannot fall below either supplied assessment.

<a id="shared-care-space"></a>

### 🏠 Shared care space

- One active pet profile shared across all three features.
- Up to **10 timestamped assessments** stored locally.
- Result sharing through the platform share interface, with a clipboard fallback on supported browsers.
- Connection settings for the API address, an optional server access token, and a connectivity check.
- Local-data clearing from the privacy settings.
- A consistent four-tab interface with reusable forms, notices, and result cards.

[↑ Back to contents](#contents)

<a id="user-flows"></a>

## 🔀 User flows

| Entry point      | Required input                                           | Optional input                                          | Requires an earlier assessment? |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------- | ------------------------------- |
| Health           | Required pet details, symptoms, and onset                | Breed, conditions, allergies, recent-change information | No                              |
| Behavior         | 1–8 photos                                               | Pet profile and behavior context                        | No                              |
| Emotion          | At least one photo **or** a description of 8+ characters | Pet profile; photos and text can be combined            | No                              |
| Combined summary | A current Health or Behavior result                      | Both results for additional context                     | Yes                             |

Saved profile information enriches an analysis without becoming a mandatory onboarding step for Behavior or Emotion. Partial profiles are supported: unknown age or weight is omitted rather than converted into a fabricated value.

[↑ Back to contents](#contents)

<a id="architecture"></a>

## 🏗️ Architecture

```mermaid
flowchart TD
    UI[Expo / React Native app] --> Validation[Client input validation]
    UI <--> Local[AsyncStorage: profile, drafts, history]
    Validation --> API[Node.js HTTP API]
    API --> Contracts[Shared Zod request contracts]
    Contracts --> Provider[OpenAI Responses API: text and images]
    Provider --> Output[Structured output validation]
    Output --> Safety[Photo evidence checks and urgency rules]
    Safety --> Results[Typed result cards and local history]
```

<a id="technical-stack"></a>

### Technical stack

| Layer          | Implementation                                                               |
| -------------- | ---------------------------------------------------------------------------- |
| Client         | React Native 0.81, React 19, Expo SDK 54                                     |
| Navigation     | Expo Router with Home, Health, Behavior, and Emotion tabs                    |
| Language       | TypeScript across client, server, and shared contracts                       |
| State          | React Context and hooks; AsyncStorage for selected local data                |
| Image handling | Expo ImagePicker and ImageManipulator                                        |
| API            | Node.js HTTP server, executed with `tsx`                                     |
| AI integration | OpenAI Responses API with strict JSON-schema output; default model `gpt-4.1` |
| Validation     | Zod request and response schemas                                             |
| Testing        | Node.js test runner, mocked provider responses, HTTP integration tests       |
| Code quality   | TypeScript, ESLint, Prettier                                                 |

<a id="engineering-decisions"></a>

### Engineering decisions

**Shared contracts across the network boundary.** Client inputs are checked before submission, and the API validates requests again. AI output must pass both structured-output parsing and application-level checks before being shown.

**Independent workflows with shared context.** Behavior and Emotion accept optional or partial profiles while Health keeps its stricter requirements. Each photo workflow has its own inputs. A separate summary request preserves the original combined-assessment capability.

**Protection against outdated results.** Editing profile or symptom details invalidates current assessments. Changes to Behavior photos/context invalidate its result and the combined summary; Emotion edits invalidate its own result. Revision checks discard responses when relevant state changes during an in-flight request.

**Explicit request lifecycles.** Requests support cancellation, a 55-second client deadline, and a 45-second provider timeout. Invalid responses, refusals, unavailable credentials, quota errors, and network failures produce actionable errors rather than fabricated results.

**Server-side provider credentials.** The client calls the project API, which calls OpenAI. Provider keys are never required in the mobile or web bundle.

[↑ Back to contents](#contents)

<a id="getting-started"></a>

## 🚀 Getting started

<a id="prerequisites"></a>

### Prerequisites

- Node.js **22 or later** and npm.
- An OpenAI API key with access to the configured model for live analysis.
- For native iOS development: macOS, Xcode, and CocoaPods.
- For native Android development: the Android SDK and a configured emulator or device.

The project also declares a development Node binary dependency so npm scripts can use the supported runtime after installation.

<a id="install-and-configure"></a>

### Install and configure

From the repository root:

```sh
npm install
```

Create a local environment file if one does not already exist:

```sh
cp .env.example .env
```

Set the required server-side key in `.env`. If the file already exists, edit it in place rather than copying over it:

```dotenv
OPENAI_API_KEY=your_api_key_here
```

The following settings are optional: the server uses these defaults when they are omitted.

```dotenv
OPENAI_MODEL=gpt-4.1
API_PORT=8787
API_HOST=127.0.0.1
```

For phone testing on the same trusted Wi-Fi network, use `API_HOST=0.0.0.0` instead. Keep that value if your existing `.env` is already configured for phone access; changing it to `127.0.0.1` would restrict the API to the computer itself. `API_PORT` can remain omitted when using port `8787`.

Start the app and API together:

```sh
npm run dev
```

- Web app: **http://localhost:8082**
- API status: **http://localhost:8787/api/status**

The development command starts both processes. Changes to `.env` restart the API automatically; stop both with `Ctrl+C`. Client-side environment changes may require restarting Expo and reloading the app.

<a id="configuration"></a>

### Configuration

| Variable              | Purpose                                            | Default / behavior                                              |
| --------------------- | -------------------------------------------------- | --------------------------------------------------------------- |
| `OPENAI_API_KEY`      | Server-side provider credential                    | Required for live AI analysis                                   |
| `OPENAI_MODEL`        | Model supporting image input and structured output | `gpt-4.1`                                                       |
| `API_PORT`            | API listening port                                 | `8787`                                                          |
| `API_HOST`            | API listening interface                            | `127.0.0.1`; use `0.0.0.0` for trusted LAN testing              |
| `EXPO_PUBLIC_API_URL` | Optional client API address                        | Otherwise inferred from the development host, using port `8787` |
| `ALLOWED_ORIGINS`     | Comma-separated browser origin allowlist           | Localhost / loopback on ports `8081` and `8082`                 |
| `API_ACCESS_TOKEN`    | Shared access token for a private instance         | Optional in development; required for production analysis       |
| `NODE_ENV`            | Enables production access-control enforcement      | Set to `production` for deployment                              |
| `EXPO_PORT`           | Expo port used by `npm run dev`                    | `8082`                                                          |

An API URL entered in **Home → Connection & privacy** takes precedence over the configured/default address. If changing the API port, update the client address as well.

<a id="run-on-a-phone"></a>

### 📱 Run on a phone

**📱 Classroom demo workflow: open the app in Expo Go by scanning the terminal QR code.** You do not need to compile a native app for this workflow.

1. **Prepare Expo Go.** Use an Expo Go version compatible with this project’s **Expo SDK 54**. See the [official version selector](https://expo.dev/go?sdkVersion=54) if you encounter an SDK mismatch; the newest store release is not automatically compatible with every older project.
2. **Connect to the same Wi-Fi.** Keep the phone and computer on the same trusted network.
3. **Allow the phone to reach the API.** In the computer’s `.env`, keep your server API key and set:

   ```dotenv
   API_HOST=0.0.0.0
   API_PORT=8787
   ```

   The port line is optional because `8787` is the default. `0.0.0.0` is the server’s listening setting, not an address to enter on the phone.

4. **Start both services on the computer.**

   ```sh
   npm run dev
   ```

   Keep this terminal running. Expo serves the app on port `8082`; the separate analysis API runs on port `8787`. If Expo targets a development build, press `s` in the Expo terminal to switch to Expo Go.

5. **Scan the QR code.** On iPhone, scan with Camera and follow the link to Expo Go. On Android, use the QR scanner in Expo Go. Allow local-network access when prompted. If Expo Go requests account sign-in, follow the message and use the same Expo account in the app and Expo CLI.
6. **Check the API connection.** In **Home → Connection & privacy**, use the connection test. The app normally derives the API address from the Expo development host. If needed, enter `http://YOUR_COMPUTER_LAN_IP:8787`, replacing the placeholder with the computer’s Wi-Fi IP address.
7. **Try a feature.** Complete the Health intake, upload a photo in Behavior, or describe a situation in Emotion. Live analysis requires a valid server-side API key; simply opening the app does not verify provider access.

**Troubleshooting:** If the app opens but analysis says “Cannot reach the server,” check the API process, `API_HOST`, phone permissions, Wi-Fi network, and API URL. The phone’s `localhost` refers to the phone, not your computer. An Expo tunnel carries the app connection; it does not automatically expose the separate API.

Reference: [Expo’s official device-start guide](https://docs.expo.dev/get-started/start-developing/).

<a id="native-development-builds"></a>

### Optional native development builds

For native builds, keep the API running in another terminal:

```sh
npm run server
# In a second terminal, choose one:
npm run ios
npm run android
```

The iOS native project is checked in; Expo generates the Android native project when needed for a local Android build. Native dependency or permission changes require rebuilding a custom development client. Release builds require an **HTTPS** API address.

[↑ Back to contents](#contents)

<a id="testing"></a>

## 🧪 Testing

```sh
npm run typecheck
npm run lint
npm test
npm run build:web
npm run build:all
```

`build:all` exports web assets and iOS/Android JavaScript/Hermes bundles; it does not create signed store binaries.

<a id="automated-coverage"></a>

### Automated coverage

The current suite contains **21 passing tests**, including:

- Required Health fields and optional/partial profiles for independent workflows.
- Photo count, transport, and evidence-reference validation.
- Emotion requests using only text or only photos.
- Structured output, missing fields, refusal, and incomplete-response handling.
- Emergency overrides and combined-summary urgency preservation.
- Credentials, quota, network errors, deadlines, and cancellation.
- HTTP authorization, CORS, request size limits, and rate limiting.
- Production requests failing closed without access control.
- Checks for provider secrets and direct provider endpoints in client source.

Provider calls in automated tests are mocked. Passing tests verify application behavior, not medical accuracy or live model quality.

<a id="demo-mode-without-an-api-key"></a>

### Demo mode without an API key

```sh
npm run test:ui-server
```

This starts an isolated fixture API at **http://localhost:8788**. Enter that URL in the web app’s Connection settings to exercise result cards, sharing, and history. Every fixture result is labeled **TEST FIXTURE**. Restore the API override to blank afterward.

The real API never silently falls back to this service. This fixture server binds to loopback and is intended for local browser testing.

<a id="verification-status"></a>

### Verification status

| Area                                       | Status                                                                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Latest workflow revision                   | TypeScript, ESLint, and 21 automated tests passed                                                              |
| Browser interaction                        | Independent entry screens, profile summaries, empty-input validation, and earlier result/history flows checked |
| Web and mobile bundle exports              | Passed during the earlier implementation; not rerun after the latest workflow revision                         |
| Native iOS compilation                     | Earlier unsigned simulator build passed for arm64 and x86_64; not a physical-device test                       |
| Live provider evaluation                   | Pending valid provider credentials and representative test cases                                               |
| Physical-device photo/lifecycle acceptance | Still required                                                                                                 |
| Veterinary review and user study           | Not completed                                                                                                  |

See [the verification report](docs/TEST_REPORT.md) for details and remaining acceptance items.

[↑ Back to contents](#contents)

<a id="api-overview"></a>

## 🔌 API overview

<a id="api-status"></a>

### `GET /api/status`

Returns:

```json
{ "configured": true }
```

`configured` indicates that a provider key is present. It does **not** validate the key, model access, billing, or quota.

<a id="api-analyze"></a>

### `POST /api/analyze`

Accepts a validated JSON request containing:

| Field            | Meaning                                                                |
| ---------------- | ---------------------------------------------------------------------- |
| `kind`           | `health`, `behavior`, `emotion`, or `summary`                          |
| `profile`        | Required complete Health profile; nullable/partial for other workflows |
| `case`           | Symptom intake; empty symptom/onset strings allowed outside Health     |
| `context`        | Behavior or emotion description                                        |
| `images`         | Up to eight base64 JPEG data URLs for Behavior/Emotion                 |
| `healthResult`   | Current Health result for a combined summary, otherwise `null`         |
| `behaviorResult` | Current Behavior result for a combined summary, otherwise `null`       |

The response is `{ "result": ... }`; errors use `{ "error": "..." }`. The complete request and result definitions live in [`shared/contracts.ts`](shared/contracts.ts).

The API enforces a 13 MB request-body limit, at most four concurrent analyses, and an in-memory limit of ten analysis requests per IP per minute. These controls apply per server process.

[↑ Back to contents](#contents)

<a id="data-and-privacy"></a>

## 🔒 Data and privacy

| Data                                                                  | Handling                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Pet profile, Health draft, Behavior context, API URL, last 10 results | Stored locally using AsyncStorage                                       |
| Selected photos, Emotion draft, current result state, access token    | Held in app memory; not persisted to AsyncStorage                       |
| Submitted analysis inputs                                             | Sent to the project API and then OpenAI when the user requests analysis |
| Photos and results on the API server                                  | No application database or persistent storage                           |

Local storage is not encrypted. Image-processing tools or the operating system may retain temporary cache files. Historical results remain available after a reload, but they are not automatically reused as current assessments.

OpenAI requests set `store: false`; this is not a claim of zero provider retention. The server does not log request bodies or photos. Keep provider credentials in server environment variables, never in `EXPO_PUBLIC_*` variables or committed files. `.env` files are ignored; `.env.example` contains configuration placeholders.

[↑ Back to contents](#contents)

<a id="deployment-considerations"></a>

## ☁️ Deployment considerations

The frontend and API are separate deployment units:

- Export the web app with `npm run build:web` and host the generated `dist/` directory.
- Run the Node API on a service that supports the project’s Node runtime and dependencies.
- Configure a public HTTPS API URL for the client and allow the frontend origin in `ALLOWED_ORIGINS`.
- Set `NODE_ENV=production`, `OPENAI_API_KEY`, and `API_ACCESS_TOKEN` on the API host. Enter the access token in the app’s Connection settings.

The current shared-token access model is intended for a private instance. A public multi-user release would need per-user authentication, deployment-aware rate limiting, operational monitoring, and a reviewed privacy policy. No public deployment or app-store release is included in the repository.

[↑ Back to contents](#contents)

<a id="limitations-and-future-work"></a>

## 🔭 Limitations and future work

- **Educational assistance:** results are not diagnoses and do not replace veterinary care.
- **Still-image input:** no video processing, motion tracking, or continuous monitoring.
- **Uncalibrated confidence:** scores are model estimates, not clinically validated probabilities.
- **Single active pet:** no multi-pet account system or cloud synchronization.
- **English interface:** localization is not yet implemented.
- **Evaluation work:** live text/vision evaluation, physical-device acceptance, veterinary review, user feedback, and a recorded demo remain future work.

Potential extensions include multi-pet profiles, account-based synchronization, localization, stronger provider evaluation datasets, and video-based observation after appropriate validation.

[↑ Back to contents](#contents)

<a id="project-structure"></a>

## 📁 Project structure

```text
app/                      Expo Router screens and tab layout
components/               Reusable controls, photo input, profile summary, results
lib/
  api.ts                  API address resolution and requests
  use-analysis.ts         Validation, request lifecycle, cancellation
  store.tsx               Shared state, persistence, result invalidation
  optional-profile.ts     Extraction of valid optional profile fields
shared/contracts.ts       Shared Zod schemas, types, safety messages
server/
  index.ts                HTTP routes, access control, request limits
  analysis.ts             Provider integration, output and safety validation
scripts/                  Development launcher and isolated UI fixture server
tests/                    Contract, provider, and HTTP integration tests
assets/                   App artwork, icons, and fonts
ios/                      Native iOS project
docs/                     Product brief, syllabus mapping, demo script, test report
```

[↑ Back to contents](#contents)

<a id="supporting-documents"></a>

## 📚 Supporting documents

- [Product brief](docs/PRODUCT_BRIEF.md)
- [Syllabus coverage and acceptance checklist](docs/SYLLABUS.md)
- [Demo recording script](docs/DEMO.md) — a script, not a completed recording.
- [Verification report](docs/TEST_REPORT.md)

[↑ Back to contents](#contents)

<a id="portfolio-highlights"></a>

## 💼 Portfolio highlights

This project demonstrates full-stack TypeScript development, cross-platform interface design, multimodal AI integration, shared runtime validation, asynchronous state management, and deterministic API testing.

The implementation includes independent text/image workflows, optional shared context, structured AI results, stale-response protection, server-side credential handling, and explicit boundaries between tested software behavior and unverified model quality.

[↑ Back to contents](#contents)
