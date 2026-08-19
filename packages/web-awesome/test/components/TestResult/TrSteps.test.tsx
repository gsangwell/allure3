import { cleanup, render } from "@testing-library/preact";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.hoisted(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation(() => ({
      matches: false,
      media: "",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

import type { TrBodyItem } from "@/components/TestResult/bodyItems";
import { TrSteps } from "@/components/TestResult/TrSteps";
import { TrStep } from "@/components/TestResult/TrSteps/TrStep";
import { collapsedTrees, expandedTrees } from "@/stores/tree";

const nestedPassedStep = {
  type: "step",
  item: {
    stepId: "nested-passed-step",
    name: "nested passed step",
    status: "passed",
    parameters: [],
    message: "",
    trace: "",
    hasSimilarErrorInSubSteps: false,
  },
  suppressInlineError: false,
  bodyItems: [],
} satisfies TrBodyItem;

const passedStepWithContent = {
  type: "step",
  item: {
    stepId: "passed-step",
    name: "passed step",
    status: "passed",
    parameters: [],
    message: "",
    trace: "",
    hasSimilarErrorInSubSteps: false,
  },
  suppressInlineError: false,
  bodyItems: [nestedPassedStep],
} satisfies TrBodyItem;

const failedStepWithContent = {
  type: "step",
  item: {
    stepId: "failed-step",
    name: "failed step",
    status: "failed",
    parameters: [],
    message: "failed",
    trace: "trace",
    hasSimilarErrorInSubSteps: false,
  },
  suppressInlineError: false,
  bodyItems: [nestedPassedStep],
} satisfies TrBodyItem;

const stepWithSeverity = {
  type: "step",
  item: {
    stepId: "severity-step",
    name: "check SSH login",
    status: "failed",
    parameters: [
      { name: "severity", value: "warning", hidden: false, excluded: false, masked: false },
      { name: "host", value: "server-1", hidden: false, excluded: false, masked: false },
    ],
    message: "failed",
    trace: "trace",
    hasSimilarErrorInSubSteps: false,
  },
  suppressInlineError: false,
  bodyItems: [],
} satisfies TrBodyItem;

const passedStepWithStatusDetails = {
  type: "step",
  item: {
    stepId: "passed-status-details-step",
    name: "passed status details step",
    status: "passed",
    parameters: [],
    message: "The check passed.",
    trace: "trace",
    hasSimilarErrorInSubSteps: false,
  },
  suppressInlineError: false,
  bodyItems: [],
} satisfies TrBodyItem;

describe("components > TestResult > TrSteps", () => {
  beforeEach(() => {
    cleanup();
    collapsedTrees.value = new Set();
    expandedTrees.value = new Set();
    globalThis.allureReportOptions = { stepTreeExpansion: "expand_failed_only" } as any;
  });

  it("always shows the steps root container regardless of step status", () => {
    const view = render(<TrSteps id="test" bodyItems={[passedStepWithContent]} />);

    expect(view.getByTestId("test-result-steps-root")).toBeInTheDocument();
  });

  it("opens top-level passed steps by default even with expand_failed_only", () => {
    const view = render(<TrStep item={passedStepWithContent} stepIndex={1} isTopLevel={true} />);

    expect(view.getByTestId("test-result-step-content")).toBeInTheDocument();
  });

  it("collapses top-level steps when policy is collapsed", () => {
    globalThis.allureReportOptions = { stepTreeExpansion: "collapsed" } as any;
    const view = render(<TrStep item={passedStepWithContent} stepIndex={1} isTopLevel={true} />);

    expect(view.queryByTestId("test-result-step-content")).not.toBeInTheDocument();
  });

  it("opens top-level failed steps by default with expand_failed_only", () => {
    const view = render(<TrSteps id="failed-test" bodyItems={[failedStepWithContent]} />);

    expect(view.getByTestId("test-result-step-content")).toBeInTheDocument();
  });

  it("collapses nested passed steps by default with expand_failed_only", () => {
    const view = render(<TrStep item={passedStepWithContent} stepIndex={1} isTopLevel={true} />);

    expect(view.queryAllByTestId("test-result-step-content")).toHaveLength(1);
  });

  it("shows a severity parameter beside the step title instead of in metadata", () => {
    const view = render(<TrStep item={stepWithSeverity} stepIndex={1} isTopLevel={true} />);

    expect(view.getByTestId("test-result-step-header")).toContainElement(view.getByTestId("test-result-step-severity"));
    expect(view.getByTestId("test-result-step-severity")).toHaveTextContent("warning");
    expect(view.queryByText("severity")).not.toBeInTheDocument();
    expect(view.getByText("host")).toBeInTheDocument();
  });

  it("labels passed step details as passed instead of an error", () => {
    const view = render(<TrStep item={passedStepWithStatusDetails} stepIndex={1} isTopLevel={true} />);

    expect(view.getByTestId("test-result-error-header")).toHaveTextContent("Passed");
  });
});
