const configuredBasePath = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") || "/";

/**
 * GitHub Pages publishes this app under /polypmna/, while custom domains
 * publish the same artifact at /. Keep the build base for asset URLs, but
 * select the correct runtime router basename from the active hostname/path.
 */
export function getRuntimeBasePath(): string {
  if (typeof window === "undefined") return configuredBasePath;

  const hostname = window.location.hostname;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const isGitHubProjectSite = hostname.endsWith(".github.io") &&
    (configuredBasePath === "/" || window.location.pathname === configuredBasePath || window.location.pathname.startsWith(`${configuredBasePath}/`));

  return isLocalHost || isGitHubProjectSite ? configuredBasePath : "/";
}

export function getRuntimeBaseUrl(): string {
  const basePath = getRuntimeBasePath();
  return basePath === "/" ? "/" : `${basePath}/`;
}
