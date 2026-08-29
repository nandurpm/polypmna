# Convex Authentication Providers

## Purpose

Contains concrete authentication provider implementations registered by `../auth.ts`.

## Contents

- `emailOtp.ts` — email one-time-password delivery and verification-code generation.

## Responsibilities

Authentication provider details belong here; authorization checks remain in each protected backend operation.

## Important Notes

Provider configuration and key material are security-sensitive and must come from deployment environment variables.
