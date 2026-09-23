# Pet Health Assistant — Product Brief

## Problem and audience

Pet owners notice changes in appetite, activity, posture, or behavior but may struggle to organize observations and decide what to discuss with a veterinarian. This app turns a pet profile, symptom notes, and optional photos into understandable, cautious next steps.

## Experience

The owner creates one pet profile, describes symptoms and onset, and receives an educational triage assessment. Independently, they can add 1–8 photos for Behavior, or photos and/or a description for Emotion. Neither requires a profile or prior assessment; valid saved profile fields are automatically summarized and used. An optional unified summary combines available evidence and shows an urgency level, next steps, general diet/hydration guidance, calming suggestions, and environmental adjustments. Results can be revisited locally and shared with a veterinarian.

## Functional scope

- Dogs, cats, and explicitly specified other species; age in months/years and weight in kg/lbs.
- Context about food, activity, environment, allergies and existing conditions.
- Server-side OpenAI text and vision integration with validated structured results.
- Numbered photo evidence and clearly labeled, uncalibrated confidence scores.
- Shared state across four tabs, persistent profile/draft/history, and stale-result protection.
- Loading, cancellation, retry, missing configuration, provider failure, rate-limit, and timeout states.
- Responsive web UI and Expo iOS/Android code paths.

## Product boundaries

This is educational assistance, not a diagnostic device. It does not prescribe medications or doses, confirm emotions, guarantee safety, or replace professional veterinary care. Static photos cannot establish motion or duration. Explicit urgent signs show immediate guidance independent of AI availability. A summary cannot reduce the urgency of its input assessments. Diet suggestions are deferred to the veterinarian in high-urgency cases.

The syllabus heading mentions video; its detailed acceptance criteria specify a multi-image upload flow. This implementation follows those concrete criteria. It does not perform video tracking or motion analysis.

## Data and trust

The user sees what information is transmitted before Analyze. Provider credentials stay on the backend. Profiles, notes and the last 10 results are stored on the current device; image bytes remain in memory, and can be removed before upload. There is no account system, photo archive, cross-device sync, or public production deployment. A local clearing control removes the app’s saved data.

## Success measures for user testing

Ask owners to complete a profile and assessment unaided, identify the displayed urgency, locate the next step, add and remove photos, explain the difference between evidence and a possible emotion, and reopen a past result. Record completion time, errors, misunderstood language, and whether the veterinary disclaimer is understood. Review feedback before claiming usability validation.
