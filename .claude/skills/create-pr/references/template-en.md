# English PR template

Use for overseas or international open-source projects. Fill every section from the actual diff and commits.
Delete a section (heading included) when it does not apply, instead of writing "N/A".
Lines starting with `>` below are instructions for you; do not copy them into the PR body.

---

## Summary

> 1-3 sentences: what this PR changes and why. Lead with the user-visible effect or the problem solved.

## Changes

> Bullet list grouped by behavior, not by file. One line each. Mention breaking changes first, prefixed with **Breaking:**.

-

## Motivation

> Why this is needed: the bug, limitation, or request. Link the issue if there is one. Delete if the summary already covers it.

## How to test

> Concrete steps a reviewer can run: commands, inputs, expected result. Use the project's real commands.

1.

## Screenshots

> Only for UI changes. Before/after table. Delete otherwise.

| Before | After |
| --- | --- |
|  |  |

## Checklist

> Check only what you actually verified in this run. Leave the rest unchecked.

- [ ] Tests added or updated for changed behavior
- [ ] Test suite passes locally (`<test command>`)
- [ ] Lint and type checks pass (`<lint/typecheck command>`)
- [ ] Docs updated where behavior or configuration changed
- [ ] No secrets, credentials, or local config committed

## Related issues

> `Closes #123` / `Refs #456`. Delete if none.
