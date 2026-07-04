# Driving codex-plus from an external orchestrator (e.g. Claude Code)

Only relevant when another agent launches Codex instead of the user running Codex directly.
When Codex is launched directly, `~/.codex/skills/codex-plus/SKILL.md` is loaded by Codex
itself and no orchestration is needed — that is the standalone path.

## Invocation

Write the full prompt (the SKILL.md procedure + a `# Task` section with the spec and the
exact output directory) to a temp file, then:

```sh
codex exec --full-auto --skip-git-repo-check \
  -C <output-dir> \
  --output-last-message /tmp/codex-last-message.txt \
  - < /tmp/codex-plus-prompt.txt
```

- `--full-auto` = sandboxed workspace-write with on-failure approvals; the safe default.
  Never use `--dangerously-bypass-approvals-and-sandbox`.
- `-C <output-dir>` scopes the working root; the sandbox may block writes outside it, hence
  the `_scratch/` convention instead of /tmp.
- Add `-m <model>` only if the user names a model.
- `codex exec` is fire-and-forget: no mid-run steering. Follow up with
  `codex exec resume --last "<message>"`.

## Orchestrator duties

- Own final verification: run the produced test suite yourself, spot-check 2–3 spec lines,
  report tested-vs-claimed honestly.
- On test failure, resume the Codex session with the failure output rather than fixing
  silently.
- Long tasks: run the Bash call in the background and read the `--output-last-message` file
  on exit.
