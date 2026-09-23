# Syllabus coverage

| Class | Requirement | Implementation / acceptance |
| --- | --- | --- |
| 3 | Forms, cards, sections; pet basics; validation and UX | Four tabs, reusable form components, species/age/weight units, allergy/condition inputs, persisted profile, client + server validation, accessible controls |
| 4 | AI integration, prompts, returned analysis | Server-only OpenAI Responses API; profile + symptoms + context; strict schema and runtime parsing; explicit user-facing failures |
| 5 | WebMD-style causes / urgency / next steps; red flags; disclaimer; error handling | Result cards, labeled urgency, emergency checklist, fixed disclaimer, timeout, cancellation/retry, invalid/refused response handling |
| 6 | Personalized general diet; foods / avoid / frequency / hydration; constraints | Diet section on results, allergies and species in prompt, emergency override, no medication or dose instruction |
| 7 | 1–8 photos; preview/add/remove; contextual text; structured behaviors, confidence, evidence | Behavior page; JPEG normalization/resizing, count/size caps; numbered evidence; subjective confidence and still-image limitations |
| 8 | Possible emotions; unified health assessment; urgency; calming / environment | Emotion supports independent photo/text analysis with optional profile; optional combined summary integrates current assessments and preserves urgency floor |
| 9 | Testing, feedback, refinement; demo + README + product brief | 18 automated tests, three-platform export checks and a successful native iOS simulator build; browser checks recorded in TEST_REPORT; README, product brief, and demo script. Physical-device testing and real user feedback require actual device/user sessions; see verification report for status. |

## Acceptance walkthrough

1. Submit an empty form and confirm an actionable error.
2. Enter a profile, explicit units, symptom description, and onset. Reload and confirm it is retained.
3. Select an urgent sign; confirm emergency guidance appears immediately. Deselect after the exercise.
4. Generate a health result; check all required result sections and the fixed disclaimer.
5. Add no photos and confirm analysis is rejected; add 1 and verify the preview numbers.
6. Remove a photo and confirm the minimum updates. Add up to 8; the Add control becomes disabled.
7. Generate behavior results with context; match photo references with the preview. Unclear/non-pet photos must not create fabricated evidence.
8. With no profile or prior assessment, analyze Emotion using description only and photo only; confirm empty input is rejected. Verify a partial Health profile appears in both independent pages. Also generate the optional combined summary from existing results.
9. Change profile/symptoms after a result; current results disappear while history remains explicitly historical.
10. Review a saved result, share/copy it, and test server connection. Disconnect the server or use an invalid URL to check recovery.
11. Exercise mobile layout and native photo picker on physical iOS and Android devices.
12. Collect user feedback using the tasks in the product brief; make and record any resulting changes.
