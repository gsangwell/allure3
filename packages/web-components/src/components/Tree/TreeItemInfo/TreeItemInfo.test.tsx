import { render, screen } from "@testing-library/preact";
import { story } from "allure-js-commons";
import { beforeEach, describe, expect, it } from "vitest";

import { TreeItemInfo } from "./index";

beforeEach(async () => {
  await story("TreeItemInfo");
});

describe("TreeItemInfo", () => {
  it("prefers a formatted stop time over start time and duration", () => {
    render(
      <TreeItemInfo
        duration={0}
        start={1735689600000}
        stop={1735689601000}
        formatTimestamp={(timestamp) => `Ran at ${timestamp}`}
      />,
    );

    expect(screen.getByTestId("tree-leaf-duration")).toHaveTextContent("Ran at 1735689601000");
  });

  it("falls back to duration when no formatted start time is provided", () => {
    render(<TreeItemInfo duration={1000} />);

    expect(screen.getByTestId("tree-leaf-duration")).toHaveTextContent("1s");
  });
});
