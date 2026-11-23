# domain-resetter
Firefox WebExtension that deletes browsing data for the current site.

## Rules
- Read manifest.json and the background/popup scripts before proposing changes.
- Do NOT add permissions or change manifest.json unless I approve it.
- Small steps. Write a failing test first, then the fix.
- Never delete, skip or weaken a test to make it pass. Never touch files under tests/ except to add tests.
- Run `npm test` and `npx web-ext lint` after every change and paste the output.
- Stop and report after 3 failed fix attempts on the same problem.
- Do not run git push, git commit or publish anything.
