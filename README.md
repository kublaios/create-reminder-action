# About this fork

This fork contains custom logic for parsing the reminder text over the [parse-reminder](https://github.com/bkeepers/parse-reminder) library (see [utilities.js](utilities.js)) and supports more time units like hours and minutes.

# Create a Reminder Action

[![Push Events](https://github.com/agrc/create-reminder-action/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/create-reminder-action/actions/workflows/push.yml)

## About

Based on the [probot reminder bot](https://github.com/probot/reminders/) that no longer works. Now in a 2 part github action form! One action to create the reminder metadata and label. And another to run on a schedule to let you know when your reminder is due.

_This action requires the use of [agrc/reminder-action](https://github.com/agrc/reminder-action) as well._

Use the `/remind` slash command to set a reminder on any comment box on GitHub and you'll get a ping about it again when the reminder is due.

Use any form of `/remind me [what] [when]`, such as:

- `/remind me to deploy on Oct 10`
- `/remind me next Monday to review the requirements`
- `/remind me that the specs on the rotary girder need checked in 6 months`

## Sample Usage

```yml
name: 'create reminder'

on:
  issue_comment:
    types: [created, edited]

jobs:
  reminder:
    runs-on: ubuntu-latest

    steps:
      - name: check for reminder
        uses: agrc/create-reminder-action@v1
```

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos. Packaging the action will create a packaged action in the dist folder.

1. Semantic version (_for major changes, a new v(major) branch is required_)

   ```bash
   npm version (minor | patch) --no-commit-hooks --no-git-tag-version
   ```

1. Run prepare

   ```bash
   npm run prepare
   ```

1. Since the packaged index.js is run from the dist folder.

   ```bash
   git add dist package*.json
   ```

1. Commit changes

   ```bash
   git commit -m "release: v1.*.*"
   ```

1. Use the draft a release workflow on GitHub.
   - [pick a color](https://perchance.org/color-name) + [pet name generator](https://www.namegenerator.co/animals/pet-name-generator) with the first letter matching the first letter of the color
