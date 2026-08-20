import type { Statistic } from "@allurereport/core-api";
import { epic, feature, label, story } from "allure-js-commons";
import { beforeEach, describe, expect, it } from "vitest";

import { getPieChartValues } from "../../src/charts/d3pie.js";

beforeEach(async () => {
  await epic("coverage");
  await feature("charts");
  await story("success-rate-pie");
  await label("coverage", "charts");
});

describe("getPieChartValues", () => {
  it("excludes skipped checks from the success-rate denominator", () => {
    const statistic: Statistic = { total: 28, passed: 23, skipped: 5 };

    expect(getPieChartValues(statistic).percentage).toBe(100);
  });

  it("returns zero when every check was skipped", () => {
    const statistic: Statistic = { total: 5, skipped: 5 };

    expect(getPieChartValues(statistic).percentage).toBe(0);
  });
});
