# 7.8 AI-Assisted Development

## Role of AI

AI assistants were used as development support rather than autonomous engineering authority. Their strongest uses were exploration, UI design, debugging, documentation refinement, and alternative implementation ideas.

The project still required human decisions about scope, domain rules, architecture, security, testing, and whether a suggestion matched the actual repository.

## Verification discipline

AI output is not project evidence. A generated answer can be plausible while being incompatible with the codebase.

The safer workflow was:

Ask → Inspect → Compare with repository → Adapt → Run → Test → Review

## Engineering judgment

AI can increase the speed of producing candidate solutions without removing engineering responsibility. The engineer still decides whether a proposed rule is required, where logic belongs, whether security is enforced server-side, and whether a test proves the intended behavior.

## Limitations

Risks include hallucinated APIs, code that violates project conventions, overengineering, assumptions from unrelated applications, and false confidence.

## Evidence

**Figure 7.16 — AI-assisted workflow evidence**

Use a safe example of UI exploration or debugging. Show the task, generated suggestion, resulting artifact, and evidence that the final result was adapted or verified. Do not include credentials, private account information, confidential material, or unrelated private conversations.

If no safe screenshot exists, use a written process diagram rather than inventing evidence.

## Reflection

The useful shift was from treating AI as an answer source to treating it as a candidate-generation tool whose output must be inspected and verified.