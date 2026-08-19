const ALLOWED_EXTERNAL_URL_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

/**
 * Produces a relative URL for a same-origin target. Cross-origin targets must
 * remain absolute so that they continue to point to the intended host.
 */
export const relativeUrl = (targetUrl: string, currentUrl: string): string => {
  const target = new URL(targetUrl, currentUrl);
  const current = new URL(currentUrl);

  if (target.origin !== current.origin) {
    return target.toString();
  }

  const currentDirectory = current.pathname.endsWith("/")
    ? current.pathname
    : current.pathname.slice(0, current.pathname.lastIndexOf("/") + 1);
  const from = currentDirectory.split("/").filter(Boolean);
  const to = target.pathname.split("/").filter(Boolean);
  let sharedSegments = 0;

  while (sharedSegments < from.length && from[sharedSegments] === to[sharedSegments]) {
    sharedSegments += 1;
  }

  const path = [...Array(from.length - sharedSegments).fill(".."), ...to.slice(sharedSegments)].join("/") || ".";

  return `${path}${target.search}${target.hash}`;
};

/**
 * Produces a relative URL to another report while preserving the deployment
 * path before the current report UUID. History URLs are commonly stored from
 * the service root (for example, `/previous-report`), whereas the browser may
 * display reports below a reverse-proxy path such as `/health-reports`.
 */
export const relativeReportUrl = (
  targetUrl: string,
  currentUrl: string,
  currentReportUuid: string,
): string => {
  const target = new URL(targetUrl, currentUrl);
  const current = new URL(currentUrl);

  if (target.origin === current.origin) {
    const currentReportPath = `/${currentReportUuid}/`;
    const reportPathIndex = current.pathname.indexOf(currentReportPath);
    if (reportPathIndex !== -1) {
      const deploymentPath = current.pathname.slice(0, reportPathIndex);

      if (!target.pathname.startsWith(`${deploymentPath}/`)) {
        target.pathname = `${deploymentPath}/${target.pathname.replace(/^\/+/, "")}`;
      }
    }
  }

  return relativeUrl(target.toString(), currentUrl);
};

/**
 * Returns a normalized URL string only for explicitly allowed external schemes.
 * Unsafe or malformed values return undefined.
 */
export const sanitizeExternalUrl = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }

  const normalized = value.trim();

  if (normalized.length === 0) {
    return undefined;
  }

  const schemeMatch = normalized.match(/^([A-Za-z][A-Za-z0-9+.-]*):/);

  if (!schemeMatch) {
    return undefined;
  }

  const protocol = `${schemeMatch[1].toLowerCase()}:`;

  if (!ALLOWED_EXTERNAL_URL_PROTOCOLS.has(protocol)) {
    return undefined;
  }

  try {
    return new URL(normalized).toString();
  } catch {
    return undefined;
  }
};
