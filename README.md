# Bokeping Skills

- **Website:** [https://bokeping.com](https://bokeping.com)
- **MCP server:** [https://app.bokeping.com/mcp](https://app.bokeping.com/mcp)

Ready-made playbooks that let an AI assistant do careful bookkeeping review
work in [Bokeping](https://bokeping.com) through the Bokeping MCP server. You
can use them for a first look at a new client, a QuickBooks Online migration,
a month-end close review, 1099 readiness, the bank feed, duplicates,
reconciliations, bank rules, and checking which bank feeds which account.

Each skill is one `SKILL.md` file. It tells the assistant what to ask you,
what to check and in which order, what report to hand back, and what it must
never do on your behalf. A request like "check my books" then gets the same
careful review every time.

The skills read your books through the Bokeping MCP tools, so you need a
Bokeping account and a connected AI app. They follow the open
[Agent Skills](https://agentskills.io) format and work in Claude, Claude
Code, Codex and other apps that load skills.

## The skills

| Skill | Use it when | You get back | Needs | Can also change, if you allow it |
| --- | --- | --- | --- | --- |
| [`bokeping-intake-diagnosis`](skills/bokeping-intake-diagnosis/SKILL.md) | You are taking on a new company or client | A scope sheet, a missing-items list and next steps | `company:read`, `reports:read` | Nothing. It only reads |
| [`bokeping-qbo-migration`](skills/bokeping-qbo-migration/SKILL.md) | You are moving books from QuickBooks Online | What to export, the import order, checks before and after each file, a migration report | `company:read`, `imports:read`, `accounts:read` | `imports:write`: maps and previews each file. You start every import yourself |
| [`bokeping-period-close-review`](skills/bokeping-period-close-review/SKILL.md) | You want to close a month, quarter or year | Every close blocker and warning explained, bank and receivable/payable checks, statement tie-outs | `period_close:read`, `company:read`, `reports:read` | `journals:write`: prepares an adjusting entry your accountant asks for. You post it |
| [`bokeping-1099-readiness`](skills/bokeping-1099-readiness/SKILL.md) | You are preparing to issue 1099s | Reportable vendors, missing W-9s, tax IDs or addresses, the payments behind each total | `tax:read`, `company:read` | Nothing. It only reads |
| [`bokeping-bank-feed-review`](skills/bokeping-bank-feed-review/SKILL.md) | Bank lines have piled up in For Review | A suggested category on each line the company's own history supports, and a list of the lines that need you | `banking:read`, `accounts:read` | `banking:write`: saves suggestions that wait on the Banking page until you accept them |
| [`bokeping-duplicate-review`](skills/bokeping-duplicate-review/SKILL.md) | The same bank line seems to be there twice | Suspected pairs, graded, with the evidence for each | `banking:read` | `bank_review:write`: excludes only the lines you confirmed |
| [`bokeping-bank-reconciliation`](skills/bokeping-bank-reconciliation/SKILL.md) | You have a statement to reconcile against | A line-by-line comparison, the difference explained, and a reconciliation report | `banking:read` | `reconciliation:write`: starts, ticks and completes a reconciliation, and posts only an adjustment you explained. It completes only at a zero difference |
| [`bokeping-categorization-rules`](skills/bokeping-categorization-rules/SKILL.md) | A payee should be handled the same way every time | The rules the company has, and a new rule previewed before it is saved | `banking:read` | `bank_rules:write`: saves rules that only suggest. They never post a line on their own |
| [`bokeping-account-ownership-check`](skills/bokeping-account-ownership-check/SKILL.md) | Balances look doubled or short, or a bank was reconnected | Which connection feeds which books account, and what looks wrong | `banking:read` | Nothing. It only checks |

Every permission that changes the books starts unticked on Bokeping's
approval page. Even with one ticked, the assistant shows you each change and
waits for your yes. The skills never close a period, file a form or post a
document on their own, and they treat everything inside the books (names,
memos, descriptions) as data, never as instructions.

## Get started

### 1. Connect Bokeping to your AI app

Bokeping's MCP address is `https://app.bokeping.com/mcp`. You sign in to
Bokeping in your browser and choose the companies and permissions; you never
paste a password or an API key into the AI app.

- **Claude (web and desktop):** Settings → Connectors → Add custom connector,
  name it Bokeping, paste the address, then Connect.
- **Claude Code:**

  ```bash
  claude mcp add --transport http bokeping https://app.bokeping.com/mcp
  ```

  Then type `/mcp`, choose `bokeping` and sign in.
- **Codex:**

  ```bash
  codex mcp add bokeping --url https://app.bokeping.com/mcp --oauth-client-registration dcr
  codex mcp login bokeping --oauth-client-registration dcr --scopes <permissions>
  ```

  The help page below has the `--scopes` value that asks for every
  permission, so that you choose on the approval page.

Cursor, VS Code and the full permission list are covered in
[Connect your AI assistant](https://bokeping.com/help/ai-assistant/connect-ai-assistant/).

### 2. Run a skill

You do not have to install anything. The skills come with the connection as
MCP prompts:

- In apps with a prompt menu (often behind **+** or **/**), look for
  **Bokeping: Take the first look at a company** and the others.
- In Claude Code, type the prompt as a slash command, for example
  `/mcp__bokeping__bokeping_period_close_review`.
- Or just ask: "Can we close September?" or "Are we ready to issue 1099s for
  2025?"

### 3. Install a local copy (optional)

A local copy lets you read a skill before it runs, pin a version, or share it
with your team. It still needs the Bokeping connection to read the books.

**Claude Code, as a plugin:**

```bash
claude plugin marketplace add utaxes/bokeping-skills
claude plugin install bokeping@bokeping-skills
```

Skills from the plugin run as `/bokeping:<skill>`, for example
`/bokeping:bokeping-period-close-review`.

**Claude Code, as personal skills:**

```bash
git clone https://github.com/utaxes/bokeping-skills.git
mkdir -p ~/.claude/skills
cp -R bokeping-skills/skills/bokeping-* ~/.claude/skills/
```

For one project only, copy them into `.claude/skills/` in that project.

**Codex:** copy the folders into `~/.agents/skills/` (or `.agents/skills/`
in a repository).

**Claude (web and desktop):** build one ZIP per skill with
`bash scripts/package.sh`. Then go to Customize → Skills, choose **+**, then
**Create skill → Upload a skill**, and upload the ZIP. Skills need code
execution turned on under Settings → Capabilities.

## Keeping skills current

The copy that comes with the connection is always the current one. It is
also published at `https://app.bokeping.com/mcp/skills/<skill>.md`. Each
`SKILL.md` ends with a **Version** section: what changed, which Bokeping MCP
tools and permissions it needs, and how it was validated. If you keep a
local copy, update it from this repository from time to time.

## Repository layout

```text
skills/<skill>/SKILL.md      one playbook per folder; the folder name is the skill name
scripts/validate.mjs         checks every SKILL.md (no dependencies, Node 20+)
scripts/package.sh           builds dist/<skill>.zip for upload to Claude
.claude-plugin/              Claude Code plugin marketplace manifest
```

## Contributing

Corrections and new playbooks are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).
Run `node scripts/validate.mjs` before opening a pull request.

## Disclaimer

Bokeping is bookkeeping software. These playbooks help an AI assistant
review the books and prepare work for a person to approve. They are not
tax, legal or accounting advice. Every decision stays with you or your
accountant: whether a period is ready to close, whether a vendor is a
contractor, whether an import or an entry is right. Read each report before
acting on it, and confirm the figures in Bokeping.

## License

[Apache License 2.0](LICENSE). "Bokeping" and its logo are trademarks of
uTaxes LLC and are not covered by the license; see [NOTICE](NOTICE).
