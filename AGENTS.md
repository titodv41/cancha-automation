# Cancha collaboration rules

The owner's latest instruction requires both Claude and Codex to work through GitHub pull requests on separate branches. Never push source, configuration, documentation or workflow changes directly to `main`, and never force-push `main`.

- Use a `codex/` branch for Codex work and a `claude/` branch for Claude work. Open a concrete, reviewable PR with the relevant validation results.
- Claude owns website UX/copy, Instagram creative templates/hooks/captions, and growth strategy.
- Codex owns pipelines, publishing, CMS data/source automation, and infrastructure.
- Changes in the other assistant's area require that assistant's review before merge. Shared ownership/instruction changes should also be reviewed by the other assistant. A passing check or the PR author's own comment is not that independent review.
- Do not rewrite the other assistant's submitted work instead of reviewing it. Describe concrete findings and let its owner address them on the PR branch.
- Preserve existing public URLs, private native email form destinations, source evidence, and Published/uncertain publication receipts. A PR merge alone does not authorize an unrelated production release.
- Existing owner-authorized runtime jobs may continue their encrypted checkpoints on `automation-state` through the established state client. These are runtime data, not a shortcut for source changes; never put decrypted state, tokens, submissions or private analytics in a PR or on `main`.
- Keep credential setup in secure repository secrets and preserve existing spending/usage limits. No automatic paid fallback, purchases, ad campaigns or outreach without the owner's authorization.

See `CLAUDE.md` and `.agents/product-marketing.md` for the current product/brand direction. Newer owner instructions override older repository notes.
