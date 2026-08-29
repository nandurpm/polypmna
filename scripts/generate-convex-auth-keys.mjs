/*
 * ============================================================
 * FILE: generate-convex-auth-keys.mjs
 * PURPOSE: Generates an RSA private key and matching JWKS payload for Convex Auth deployment setup.
 * ============================================================
 */

import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDirectory = process.argv[2];
if (!outputDirectory) {
  throw new Error("Usage: node scripts/generate-convex-auth-keys.mjs <output-directory>");
}

mkdirSync(outputDirectory, { recursive: true, mode: 0o700 });
const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicExponent: 0x10001,
});
const privateKeyPem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicJwk = publicKey.export({ format: "jwk" });
const jwks = JSON.stringify({
  keys: [{ use: "sig", alg: "RS256", ...publicJwk }],
});

writeFileSync(join(outputDirectory, "JWT_PRIVATE_KEY"), privateKeyPem.trimEnd().replace(/\n/g, " "), { mode: 0o600 });
writeFileSync(join(outputDirectory, "JWKS"), jwks, { mode: 0o600 });
