# domain-resetter

Firefox WebExtension that deletes browsing data for the current site.

## Rules

- Read `manifest.json` and the background/popup scripts before proposing changes.
- Do NOT add permissions or change `manifest.json` unless I explicitly approve it.
- Work in small, logical steps. Write a failing test first, then implement the fix.
- Never delete, skip, weaken, or rewrite existing tests merely to make them pass.
- Modify existing tests only when requirements or intended behavior genuinely change. Explain why.
- Never modify files under `tests/` unless adding tests or making a justified test correction.
- Run `npm test` and `npx web-ext lint` after every logical change and report the actual output.
- Distinguish between regressions introduced by your changes, pre-existing failures, and environmental or dependency issues.
- Stop and report after 3 failed fix attempts on the same problem.
- Preserve the existing architecture and coding conventions.
- Avoid unnecessary dependencies, abstractions, and unrelated changes.
- Verify Firefox API behavior against the project's compatibility requirements rather than making assumptions.
- Do not run `git push`, `git commit`, or publish anything.

## Completion

- Summarize the files changed and explain why.
- Report test and lint results honestly.
- Identify remaining issues and unverified behavior.
- Never claim success when verification failed.