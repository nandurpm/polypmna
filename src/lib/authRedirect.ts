/** Resolve an auth redirect without allowing protocol-relative or cross-origin URLs. */
export function resolveAuthRedirect(
  returnTo: string | null,
  fallback = "/dashboard",
): string {
  if (!returnTo) return fallback;

  try {
    const origin = "https://polypmna.invalid";
    const target = new URL(returnTo, origin);
    if (target.origin !== origin || !returnTo.startsWith("/")) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
