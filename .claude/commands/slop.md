# Remove AI Code Slop

Check the diff against main branch and remove all AI-generated slop introduced in this branch.

## What to look for

- Extra comments that a human wouldn't add or are inconsistent with the rest of the file
- Extra defensive checks or try/catch blocks that are abnormal for that area of the codebase (especially if called by trusted/validated codepaths)
- Casts to `any` to get around type issues
- Unnecessary type annotations on variables with obvious types
- Over-documented functions with excessive JSDoc
- Any other style that is inconsistent with the file

## Process

1. Run `git diff main --name-only` to get changed files
2. For each changed file, run `git diff main -- <file>` to see the changes
3. Read the full file to understand the existing style
4. Edit to remove slop while preserving legitimate changes
5. Provide a 1-3 sentence summary of what was changed

$ARGUMENTS
