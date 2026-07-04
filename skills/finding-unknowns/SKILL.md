---
name: finding-unknowns
description: Use when a request is vague or aesthetic ("いい感じに", "make it good", "improve it") and the user can't articulate criteria; when the domain or codebase area is unfamiliar to the user or to you; before starting long autonomous implementation work; when forced to deviate from a plan mid-implementation; or when the user is about to merge a large diff they only skimmed.
---

# Finding Unknowns

## Overview

The map (prompt, plan, spec) is never the territory (codebase, real world). The gap between them is *unknowns*, and long-horizon work quality is bottlenecked by surfacing the right unknowns at the right time — before, during, and after implementation. Classify the unknown first, then pick the matching technique. Guessing a "sensible default" is the last resort, not the first move.

## Classify, then act

| Unknown type | Signal | Technique |
|---|---|---|
| Known unknown | User/you know what's undecided | Interview: one question at a time, prioritize questions whose answer changes the architecture |
| Unknown known | "I'll know it when I see it" (design, tone, feel) | Divergent prototypes: 3-4 *wildly different* throwaway versions (single HTML mock, fake data, no wiring). User reacts; they don't specify |
| Unknown unknown (user's) | User lacks domain vocabulary — "いい感じに", can't define "good" | Blindspot pass: teach the domain in ~5 lines first so they *can* judge. Only then show options |
| Unknown unknown (yours) | Unfamiliar codebase area or domain | Explore, then explicitly write out your assumptions before implementing — each is a question in disguise |
| Un-articulable known | Too complex/tedious to describe in words | Ask for a reference — source code beats docs beats screenshots. Point at it and reimplement the semantics |

## The anti-pattern this skill exists to stop

Converging on ONE "industry standard" spec early *because* the user can't answer questions. That inverts the logic: inability to judge is the signal to teach or to diverge, not to default. If the user can't judge, the first deliverable is (a) enough teaching for them to judge, or (b) several divergent options to react to — never a single best-practice guess presented as the plan.

## During implementation

Keep `implementation-notes.md` from the start of any long autonomous session. When an edge case forces you off-plan: take the conservative option, and log it under **Deviations** — with the why and any compatibility/data-format impact — *at the moment it happens*. Reconstructing deviations from commits at the end systematically under-reports the "smaller-looking" ones. A deviation with irreversible or migration consequences gets an immediate visible marker, not a mention in the final summary.

## Before merge of a large diff

If the user skimmed the diff ("お、終わった？マージするね"):
- Deviations are the headline of your report, not paragraph four.
- Offer an explainer + short quiz: context, intuition, what changed, what depends on existing code paths, then 3-5 questions. Suggest merging only after they pass. Diffs show *what* changed; behavior depends on code paths the diff doesn't show.

## Quick triggers

- "いい感じに" / "make it nice" / no articulable criteria → teach (blindspot pass) or diverge (prototypes)
- Entering unfamiliar territory yourself → blindspot pass on yourself; list assumptions
- Long autonomous session starting → create `implementation-notes.md` in minute one
- Plan review requested → front-load likely-to-change decisions (data model, type interfaces, UX flows); bury mechanical refactoring at the bottom
- User about to merge after a skim → explainer/quiz offer

**Cross-refs:** superpowers:brainstorming for the interview flow; superpowers:writing-plans for plan structure.
