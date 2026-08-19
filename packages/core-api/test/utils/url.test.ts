import { epic, feature, label, story } from "allure-js-commons";
import { beforeEach, describe, expect, it } from "vitest";

import { relativeReportUrl, relativeUrl, sanitizeExternalUrl } from "../../src/utils/url.js";

beforeEach(async () => {
  await epic("coverage");
  await feature("url-routing");
  await story("url");
  await label("coverage", "url-routing");
});

describe("sanitizeExternalUrl", () => {
  it("allows known-safe protocols", () => {
    expect(sanitizeExternalUrl("https://example.com/path?x=1#hash")).toBe("https://example.com/path?x=1#hash");
    expect(sanitizeExternalUrl("http://example.com")).toBe("http://example.com/");
    expect(sanitizeExternalUrl("mailto:test@example.com")).toBe("mailto:test@example.com");
    expect(sanitizeExternalUrl("tel:+123456789")).toBe("tel:+123456789");
  });

  it("rejects unsafe or malformed urls", () => {
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBeUndefined();
    expect(sanitizeExternalUrl(" data:text/html,<svg onload=alert(1)>")).toBeUndefined();
    expect(sanitizeExternalUrl("file:///etc/passwd")).toBeUndefined();
    expect(sanitizeExternalUrl("/relative/path")).toBeUndefined();
    expect(sanitizeExternalUrl("")).toBeUndefined();
    expect(sanitizeExternalUrl("   ")).toBeUndefined();
    expect(sanitizeExternalUrl(undefined)).toBeUndefined();
  });
});

describe("relativeUrl", () => {
  it("uses a relative path for same-origin report links", () => {
    const historyUrl = "https://reports.example/history/previous/index.html#test-1";
    const reportUrl = "https://reports.example/current/index.html";

    expect(relativeUrl(historyUrl, reportUrl)).toBe(
      "../history/previous/index.html#test-1",
    );
  });

  it("preserves a cross-origin target as an absolute URL", () => {
    const historyUrl = "https://other.example/history/index.html";
    const reportUrl = "https://reports.example/current/index.html";

    expect(relativeUrl(historyUrl, reportUrl)).toBe(historyUrl);
  });
});

describe("relativeReportUrl", () => {
  it("preserves a reverse-proxy deployment path for service-root history URLs", () => {
    const currentUrl = "https://reports.example/health-reports/current-report/awesome/index.html";
    const historyUrl = "https://reports.example/previous-report/awesome/index.html#test-1";

    expect(relativeReportUrl(historyUrl, currentUrl, "current-report")).toBe(
      "../../previous-report/awesome/index.html#test-1",
    );
  });

  it("uses the proxy origin and path for history URLs from another origin", () => {
    const currentUrl = "https://reports.example/health-reports/current-report/awesome/index.html";
    const historyUrl = "https://other.example/previous-report/awesome/index.html";

    expect(relativeReportUrl(historyUrl, currentUrl, "current-report")).toBe("../../previous-report/awesome/index.html");
  });
});
