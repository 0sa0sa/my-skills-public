---
name: codex-plus
description: Use when the user asks to build, implement, debug, or fix something "with codex-plus" / "高品質に実装して", or any implementation task where output will be judged on production quality. Applies the SONNET-PLUS 4-phase quality harness (plan / build / attack-your-own-work / verified finish) directly to the task at hand. If you are an orchestrator driving the codex CLI from outside (e.g. Claude Code), see ORCHESTRATION.md instead.
---

# codex-plus

Apply this operating procedure to the implementation task at hand. YOU are the implementer —
no delegation needed. The harness was blind-judge-validated on Claude Sonnet 4.6 (matched a
frontier model across 5 task types, 3–2, margins ≤ 0.6/10 — github.com/0sa0sa/sonnet-plus);
transfer to other executors is plausible but unmeasured, so do not claim validated parity
for non-Sonnet runs.

Budget roughly 30% plan, 40% build, 30% attack-and-polish.

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
- UI tasks: commit to ONE distinctive named design direction up front (concrete type pairing,
  palette, texture/motif) — never default-styled. List product micro-decisions: match prev/next
  navigation, scroll-into-view, full keyboard navigation, platform-adaptive shortcut labels,
  reachable empty states, rendering with real headroom.
- Debugging tasks: reproduce every symptom with a failing test BEFORE fixing; root-cause the
  mechanism, not the location; actively hunt adjacent defects the reports don't mention
  (other call sites of the same broken helper, other caches, other falsy-value filters,
  caller-owned data mutation).

## Phase 2 — Build

- Treat the spec as the FLOOR, not the ceiling. After covering it, add the 3–5 highest-leverage
  touches a staff engineer would ship. Do not gold-plate low-value areas.
- Use the professional idioms of the language (e.g. functools.wraps on Python decorators,
  introspection properties, precise typed exceptions with actionable messages), and docstrings
  stating exact semantics — including advisory/approximate behavior under concurrency.
- Write tests with mutation thinking: for each behavior ask "what single-character code change
  would this test FAIL to catch?" Test exact boundaries (exactly t+window, not t+window+ε),
  round-trip consistency properties, and input validation. Thread tests need real contention:
  barriers and scheduling-independent invariants.

## Phase 3 — Attack your own work (do not skip — this is the highest-value phase)

- Write throwaway adversarial probe scripts in a `_scratch/` subdirectory (deleted in Phase 4)
  that attack your public API with everything from your Phase 1 list, plus fuzzing with
  awkward values (non-binary floats, unicode, huge inputs). Fix every leak, crash, or
  silent-wrong-answer, then re-run clean.
- Beware cross-layer asymmetries: any operation done in two places (e.g. lowercasing in app
  code AND in SQL) must be verified consistent with non-ASCII input.
- Regression tests must be verified to FAIL against the pre-fix code — a regression test that
  passes on broken code guards nothing.
- Servers: probe with raw sockets too (garbage request lines, short bodies, oversized
  payloads) — never a traceback or HTML error to the client.
- UI: verify in a headless browser if available, check both themes, measure responsiveness on
  large inputs, confirm the first search match scrolls into view and empty states are reachable.
- Re-read the spec top to bottom and check off every requirements-checklist line against the
  actual artifact. Anything unverified is unfinished.

## Phase 4 — Finish

- Run the full test suite / verification one final time and report exact results in your final
  message (exact counts, not "all passing").
- Docs: document every judgment call (edge-case policies, trade-offs) precisely, without
  overclaiming — every claim in your README must be one you verified.
- The deliverable directory must contain exactly the required files — delete `_scratch/` and
  any caches.

## Adaptations by task family

| Family | Phase 1 emphasis | Phase 3 emphasis |
|---|---|---|
| Library / CLI | Input-validation matrix, invariants | API fuzzing, ULP/float boundaries |
| Frontend / UI | Named design direction, micro-decisions list | Headless-browser verify, both themes, perf measure |
| Debugging | Reproduce-first, root-cause, adjacent-defect hunt | Regression tests proven to fail on pre-fix code |
| Concurrency | Race/cancel/timeout policy table, centralized state machine | Randomized DAG/stress with watchdog, thread-leak check |
| Backend / API | Status-code matrix per endpoint × bad input | Raw-socket abuse, injection battery + direct DB inspection, concurrency reconcile |
