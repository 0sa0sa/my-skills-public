#!/usr/bin/env node
/**
 * my-skills — install SKILL.md-based skills into Claude Code and/or Codex CLI.
 *
 * Usage:
 *   npx github:0sa0sa/my-skills-public list
 *   npx github:0sa0sa/my-skills-public <skill> [<skill>...] [--claude|--codex|--both]
 *   npx github:0sa0sa/my-skills-public all
 *
 * Default target: every agent dir that exists on this machine
 * (~/.claude -> ~/.claude/skills, ~/.codex -> ~/.codex/skills).
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

const SKILLS_DIR = path.join(__dirname, "..", "skills");
const HOME = os.homedir();
const TARGETS = {
  claude: { root: path.join(HOME, ".claude"), dir: path.join(HOME, ".claude", "skills") },
  codex: { root: path.join(HOME, ".codex"), dir: path.join(HOME, ".codex", "skills") },
};

function availableSkills() {
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(SKILLS_DIR, e.name, "SKILL.md")))
    .map((e) => e.name)
    .sort();
}

function descriptionOf(skill) {
  const text = fs.readFileSync(path.join(SKILLS_DIR, skill, "SKILL.md"), "utf8");
  const m = text.match(/^description:\s*(.+)$/m);
  return m ? m[1].trim() : "";
}

function usage(code) {
  const skills = availableSkills();
  console.log(`my-skills — install skills into Claude Code / Codex CLI

Usage:
  my-skills list                         Show available skills
  my-skills <skill>... [target flags]    Install one or more skills
  my-skills all [target flags]           Install every skill

Target flags (default: every agent dir found on this machine):
  --claude    ~/.claude/skills/ only
  --codex     ~/.codex/skills/ only
  --both      force both (creates missing dirs)

Available skills: ${skills.join(", ")}`);
  process.exit(code);
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) usage(args.length ? 0 : 1);

  if (args[0] === "list") {
    for (const s of availableSkills()) {
      const desc = descriptionOf(s);
      console.log(`\x1b[1m${s}\x1b[0m`);
      if (desc) console.log(`  ${desc.length > 160 ? desc.slice(0, 157) + "..." : desc}`);
    }
    return;
  }

  const flags = new Set(args.filter((a) => a.startsWith("--")));
  let names = args.filter((a) => !a.startsWith("--") && a !== "install");
  const skills = availableSkills();

  if (names.includes("all")) names = skills;
  const unknown = names.filter((n) => !skills.includes(n));
  if (unknown.length) {
    console.error(`Unknown skill(s): ${unknown.join(", ")}\nAvailable: ${skills.join(", ")}`);
    process.exit(1);
  }
  if (names.length === 0) usage(1);

  let targets;
  if (flags.has("--both")) targets = ["claude", "codex"];
  else if (flags.has("--claude")) targets = ["claude"];
  else if (flags.has("--codex")) targets = ["codex"];
  else {
    targets = Object.keys(TARGETS).filter((t) => fs.existsSync(TARGETS[t].root));
    if (targets.length === 0) targets = ["claude"]; // sensible default on a fresh machine
  }

  for (const name of names) {
    for (const t of targets) {
      const dest = path.join(TARGETS[t].dir, name);
      fs.mkdirSync(TARGETS[t].dir, { recursive: true });
      fs.cpSync(path.join(SKILLS_DIR, name), dest, { recursive: true, force: true });
      console.log(`installed ${name} -> ${dest}`);
    }
  }
  console.log("\nDone. New sessions of the target agent(s) will pick the skill(s) up automatically.");
}

main();
