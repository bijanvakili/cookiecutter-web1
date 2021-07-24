#!/bin/sh

set -e

DIFF_CMD="git diff --name-only --cached --relative --diff-filter=ACMR"

${DIFF_CMD} | xargs yarn run lint-prettier
${DIFF_CMD} | grep '\.tsx\?$' | xargs yarn run lint-ts
${DIFF_CMD} | grep '\.md$' | xargs yarn run lint-md
