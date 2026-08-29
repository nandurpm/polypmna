# GitHub Configuration

## Purpose

Contains repository automation, dependency maintenance, and workflow definitions.

## Contents

- `dependabot.yml` — schedules dependency update proposals.
- `workflows/` — validates, monitors, scans, builds, and deploys the application.

## Responsibilities

GitHub-specific automation belongs here; application runtime code does not.

## Important Notes

Workflow secrets are referenced by name only and must remain in GitHub or Convex secret stores.
