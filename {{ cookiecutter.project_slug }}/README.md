# Drag Test

{{ cookiecutter.project_short_description }}

## Minimal Requirements

- [Node.js](https://nodejs.org/)
- [yarn](https://yarnpkg.com/)

## Setup

Install all the required Javascript packages.

    yarn set version berry
    yarn install

Set up for VSCode

    yarn dlx @yarnpkg/sdks vscode

Build the vendor packages:

    yarn run build:vendor

Build the application source:

    yarn run build:app

## Execution

To run in hot module reloading mode:

    yarn run start
    open http://localhost:8080

To create a production build:

    yarn run clean
    yarn run build:prod

## Running

To open the SPA in your browser:

    open dist/index.html

## git hooks

Set up the git pre-commit hook as follows:

    ln -s ../../scripts/pre-commit-lint.sh .git/hooks/pre-commit
