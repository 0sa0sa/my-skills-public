---
name: sonnet-plus
description: Use when the user asks to build, implement, or fix something "with sonnet-plus" / "Sonnet+PB", or wants high-quality implementation output at lower cost. Spawns a Sonnet subagent wrapped in the SONNET-PLUS 4-phase quality harness — blind-judge-validated to match frontier-model (Fable 5) output on implementation tasks at 56-84% of the cost. Not for open-ended deep audits; pair those with a frontier-model adversarial review.
---

# sonnet-plus

Run implementation tasks on a Sonnet subagent wrapped in a validated quality harness,
instead of burning frontier-model tokens on work Sonnet can do at the same judged quality.

## Evidence (why this works)

Blind-judged head-to-heads across 5 task types (2026-07, judge = frontier model, anonymized
labels): Sonnet+harness went 3–2 vs bare Fable 5 with every margin ≤ 0.6/10 — won greenfield
library (9.0–6.8), frontend (8.8–8.3), concurrency orchestrator (8.8–8.4); narrowly lost legacy
debugging (9.0–9.6) and backend API (8.3–8.6). Bare Sonnet lost the same matchups clearly
(7.4 vs 9.0). The gap is behavioral, not cognitive — the harness injects the missing habits.
Full experiment: github.com/0sa0sa/sonnet-plus

## How to apply

1. Spawn `Agent(model: "sonnet")` (general-purpose) with the PROMPT BLOCK below prepended
   to the task, then a `# Task` section containing the spec (or a pointer to a spec file)
   and the exact output directory.
2. Adapt the bracketed parts of Phase 1/3 to the task family (see Adaptations).
3. When the subagent returns, verify its claims yourself (run the tests once) before
   reporting to the user.
4. **Hybrid rule:** if the work is a deep audit, unknown-bug hunt, or final pre-ship review,
   run the build with sonnet-plus but add a separate frontier-model adversarial review pass —
   the measured residual gap is "digging beyond the enumerated list" (adjacent-defect
   discovery, deepest-probe correctness).

## PROMPT BLOCK (prepend verbatim, adapt bracketed sections)

```
You are producing work that will be blind-judged against the strongest engineer available.
Follow this operating procedure exactly. Budget roughly 30% plan, 40% build, 30% attack-and-polish.

## Phase 1 — Plan before code
- Convert the spec into an explicit requirements checklist. Every judged sentence in the spec
  becomes a checklist line. You will verify each line before finishing.
- Enumerate edge cases BEYOND the spec: for every public input, list what happens with NaN,
  ±infinity, booleans-where-numbers-expected, wrong types, negatives, zeros, empty values,
  huge values, unicode (CJK/RTL/emoji), and degenerate configurations. For each, DECIDE a
  policy (reject with a clean typed error, or support with documented semantics) and write it
  down. Never let an internal exception leak from a public API.
- Identify the core invariants of your design. Your implementation must MAINTAIN them
  explicitly (state changes through one guarded path), not satisfy them by accident.
[- UI tasks: commit to ONE distinctive named design direction up front (concrete type pairing,
  palette, texture/motif) — never default-styled. List product micro-decisions: match prev/next
  navigation, scroll-into-view, full keyboard navigation, platform-adaptive shortcut labels,
  reachable empty states, rendering with real headroom.]
[- Debugging tasks: reproduce every symptom with a failing test BEFORE fixing; root-cause the
  mechanism, not the location; actively hunt adjacent defects the reports don't mention.]

## Phase 2 — Build
- Treat the spec as the FLOOR, not the ceiling. After covering it, add the 3–5 highest-leverage
  touches a staff engineer would ship. Do not gold-plate low-value areas.
- Use professional idioms: functools.wraps on decorators, introspection properties, precise
  typed exceptions with actionable messages, docstrings stating exact semantics (including
  advisory/approximate behavior under concurrency).
- Write tests with mutation thinking: for each behavior ask "what single-character code change
  would this test FAIL to catch?" Test exact boundaries, round-trip consistency properties, and
  input validation. Thread tests need real contention: threading.Barrier and
  scheduling-independent invariants.

## Phase 3 — Attack your own work (do not skip — this is the highest-value phase)
- Write throwaway adversarial probe scripts in /tmp (never in the deliverable directory) that
  attack your public API with everything from your Phase 1 list, plus fuzzing with awkward
  values (non-binary floats, unicode, huge inputs). Fix every leak, crash, or
  silent-wrong-answer, then re-run clean.
- Beware cross-layer asymmetries: any operation done in two places (e.g. lowercasing in app
  code AND in SQL) must be verified consistent with non-ASCII input.
- Regression tests must be verified to FAIL against the pre-fix code — a regression test that
  passes on broken code guards nothing.
[- Servers: probe with raw sockets too (garbage request lines, short bodies, oversized
  payloads) — never a traceback or HTML error to the client.]
[- UI: verify in a headless browser, screenshot both themes, measure responsiveness on large
  inputs, confirm the first search match scrolls into view and empty states are reachable.]
- Re-read the spec top to bottom and check off every requirements-checklist line against the
  actual artifact. Anything unverified is unfinished.

## Phase 4 — Finish
- Run the full test suite / verification one final time and report exact results.
- Docs: document every judgment call (edge-case policies, trade-offs) precisely, without
  overclaiming — every claim in your README must be one you verified.
- The deliverable directory must contain exactly the required files — no scratch, no __pycache__.
```

## Adaptations by task family

| Family | Phase 1 emphasis | Phase 3 emphasis |
|---|---|---|
| Library / CLI | Input-validation matrix, invariants | API fuzzing, ULP/float boundaries |
| Frontend / UI | Named design direction, micro-decisions list | Headless-browser verify, both themes, perf measure |
| Debugging | Reproduce-first, root-cause, adjacent-defect hunt | Regression tests proven to fail on pre-fix code |
| Concurrency | Race/cancel/timeout policy table, centralized state machine | Randomized DAG/stress with watchdog, thread-leak check |
| Backend / API | Status-code matrix per endpoint × bad input | Raw-socket abuse, injection battery + direct DB inspection, concurrency reconcile |

## Known limitations

- Adds ~1.5–2× token usage vs a bare prompt (still cheaper than frontier: measured 56–84% cost).
- Residual frontier edge on unlisted-depth thoroughness — use the hybrid rule above.
- Validated on implementation tasks; not yet on research/long-horizon agent work.
