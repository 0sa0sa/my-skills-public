---
name: codex-plus
description: Use when the user asks to build, implement, or fix something "with codex-plus" / "Codex で(高品質に)", or wants to offload an implementation task to the OpenAI Codex CLI while keeping SONNET-PLUS-grade quality. Wraps `codex exec` in the same 4-phase quality harness that was blind-judge-validated on Claude Sonnet 4.6. Requires the `codex` CLI installed and authenticated.
---

# codex-plus

Run implementation tasks on the OpenAI Codex CLI wrapped in the SONNET-PLUS quality harness.
Same idea as the `sonnet-plus` skill, different executor: instead of spawning a Claude
subagent, drive `codex exec` non-interactively with the harness prepended to the task.

## Validation status (be honest about this)

The 4-phase harness was blind-judge-validated on **Claude Sonnet 4.6** (matched Fable 5
across 5 task types, 3–2, margins ≤ 0.6/10 — see github.com/0sa0sa/sonnet-plus). The
hypothesis that it transfers to Codex is plausible (the harness injects model-agnostic
engineering habits, not Claude-specific behavior) but **not yet measured**. Until a
head-to-head is run, treat codex-plus output with one extra verification pass, and tell
the user the transfer is unvalidated if they ask about quality guarantees.

## How to run

1. Write the full prompt (PROMPT BLOCK below + `# Task` section with the spec and the exact
   output directory) to a temp file — stdin avoids shell-quoting hell:

   ```sh
   codex exec --full-auto --skip-git-repo-check \
     -C <output-dir> \
     --output-last-message /tmp/codex-last-message.txt \
     - < /tmp/codex-plus-prompt.txt
   ```

   - `--full-auto` = sandboxed workspace-write with on-failure approvals; the safe default.
     Never use `--dangerously-bypass-approvals-and-sandbox`.
   - `-C <output-dir>` scopes the working root to the deliverable directory.
   - Add `-m <model>` only if the user names a model; otherwise respect their
     `~/.codex/config.toml` default.
   - Long tasks: run the Bash call in the background and read
     `/tmp/codex-last-message.txt` when it exits.

2. Codex's sandbox may block writes outside `-C` — so unlike the Claude variant, tell it to
   put throwaway probes in a `_scratch/` subdirectory of the output dir instead of /tmp, and
   to delete it in Phase 4.

3. `codex exec` is fire-and-forget (no mid-run steering). Put EVERYTHING in the initial
   prompt: spec, output dir, constraints, and the harness. To follow up, use
   `codex exec resume --last "<follow-up>"`.

4. **You (Claude) own final verification.** When Codex finishes, run its test suite
   yourself, spot-check 2–3 spec lines against the artifact, and report tested-vs-claimed
   honestly. If tests fail, resume the Codex session with the failure output rather than
   fixing silently.

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
- Use the professional idioms of the language (e.g. functools.wraps on Python decorators,
  introspection properties, precise typed exceptions with actionable messages), and docstrings
  stating exact semantics — including advisory/approximate behavior under concurrency.
- Write tests with mutation thinking: for each behavior ask "what single-character code change
  would this test FAIL to catch?" Test exact boundaries, round-trip consistency properties, and
  input validation. Thread tests need real contention: barriers and
  scheduling-independent invariants.

## Phase 3 — Attack your own work (do not skip — this is the highest-value phase)
- Write throwaway adversarial probe scripts in a _scratch/ subdirectory (removed before
  finishing) that attack your public API with everything from your Phase 1 list, plus fuzzing
  with awkward values (non-binary floats, unicode, huge inputs). Fix every leak, crash, or
  silent-wrong-answer, then re-run clean.
- Beware cross-layer asymmetries: any operation done in two places (e.g. lowercasing in app
  code AND in SQL) must be verified consistent with non-ASCII input.
- Regression tests must be verified to FAIL against the pre-fix code — a regression test that
  passes on broken code guards nothing.
[- Servers: probe with raw sockets too (garbage request lines, short bodies, oversized
  payloads) — never a traceback or HTML error to the client.]
[- UI: verify in a headless browser if available, check both themes, measure responsiveness on
  large inputs, confirm the first search match scrolls into view and empty states are reachable.]
- Re-read the spec top to bottom and check off every requirements-checklist line against the
  actual artifact. Anything unverified is unfinished.

## Phase 4 — Finish
- Run the full test suite / verification one final time and report exact results in your final
  message (exact counts, not "all passing").
- Docs: document every judgment call (edge-case policies, trade-offs) precisely, without
  overclaiming — every claim in your README must be one you verified.
- The deliverable directory must contain exactly the required files — delete _scratch/ and any
  caches.
```

## Adaptations by task family

Same table as the `sonnet-plus` skill (library/CLI, frontend, debugging, concurrency,
backend) — see `skills/sonnet-plus/SKILL.md`. Swap the bracketed Phase 1/3 sections
accordingly.

## When to prefer which executor

| Situation | Use |
|---|---|
| Default implementation offload (validated quality data) | sonnet-plus |
| User explicitly wants Codex / OpenAI models, or wants a second independent implementation to compare | codex-plus |
| Deep audit, unknown-bug hunt, final pre-ship review | Frontier-model adversarial review (either executor builds) |
