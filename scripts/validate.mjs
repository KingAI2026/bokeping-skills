#!/usr/bin/env node
// Checks every skills/<name>/SKILL.md: front matter first, `name` equal to
// the folder, a `description`, a body that starts with a `# ` title, the
// limits AI apps enforce on an installed skill, and the sections every
// playbook carries.
//
// Usage: node scripts/validate.mjs [skills-dir]

import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(process.argv[2] ?? "skills");
const NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RESERVED = ["anthropic", "claude"];
const REQUIRED_SECTIONS = [
  "## Before you start",
  "## Rules",
  "## Check before and after",
  "## If something goes wrong",
  "## Examples",
  "## Version",
];

const problems = [];
const report = (skill, message) => problems.push(`${skill}: ${message}`);

function parse(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return null;
  const field = (key) =>
    new RegExp(`^${key}:\\s*(.+)$`, "m").exec(match[1])?.[1]?.trim() ?? "";
  return {
    name: field("name"),
    description: field("description"),
    body: match[2].trim(),
  };
}

const folders = readdirSync(root).filter((entry) =>
  statSync(join(root, entry)).isDirectory(),
);
if (folders.length === 0) problems.push(`${root}: no skill folders`);

for (const folder of folders) {
  const file = join(root, folder, "SKILL.md");
  if (!existsSync(file)) {
    report(folder, "missing SKILL.md");
    continue;
  }
  const raw = readFileSync(file, "utf8");
  const skill = parse(raw);
  if (!skill) {
    report(folder, "SKILL.md must start with --- front matter ---");
    continue;
  }
  const { name, description, body } = skill;

  if (!raw.startsWith(`---\nname: ${folder}\n`)) {
    report(folder, "front matter must open with `name:` on its first line");
  }
  if (name !== folder) report(folder, `name "${name}" differs from the folder`);
  if (!NAME.test(name)) {
    report(folder, "name: lowercase letters, digits and single hyphens only");
  }
  if (name.length > 64) report(folder, `name is ${name.length} characters (max 64)`);
  for (const word of RESERVED) {
    if (name.includes(word)) report(folder, `name contains the reserved word "${word}"`);
  }

  if (!description) report(folder, "description is empty");
  if (description.length > 1024) {
    report(folder, `description is ${description.length} characters (max 1024)`);
  }
  if (/<[^>]+>/.test(description)) report(folder, "description contains an XML tag");

  if (!body.startsWith("# ")) report(folder, "body must start with a `# ` title");
  for (const section of REQUIRED_SECTIONS) {
    if (!body.split("\n").some((line) => line.startsWith(section))) {
      report(folder, `missing section "${section}"`);
    }
  }
}

if (problems.length > 0) {
  console.error(`${problems.length} problem(s):\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`OK: ${folders.length} skills in ${root}`);
