import { type HistoryTestResult, capitalize, relativeReportUrl } from "@allurereport/core-api";
import { getReportOptions } from "@allurereport/web-commons";
import { SvgIcon, Text, TooltipWrapper, allureIcons } from "@allurereport/web-components";
import type { FunctionalComponent } from "preact";
import type { ClassicReportOptions, ClassicTestResult } from "types";

import { useI18n } from "@/stores";
import { timestampToDate } from "@/utils/time";

import * as styles from "./styles.scss";

const TestResultPrevStatus: FunctionalComponent<{ item: HistoryTestResult }> = ({ item }) => {
  const { reportUuid } = getReportOptions<ClassicReportOptions>();
  const navigateUrl = relativeReportUrl(
    new URL(`${item.id}/index.html`, item.url).toString(),
    window.location.href,
    reportUuid,
  );

  return (
    <a className={styles["test-result-prev-status"]} href={navigateUrl} target={"_blank"} rel={"noreferrer"}>
      <SvgIcon id={allureIcons.lineShapesDotCircle} className={styles[`status-${item?.status}`]} />
    </a>
  );
};
const TestResultPrevStatusTooltip: FunctionalComponent<{ item: HistoryTestResult }> = ({ item }) => {
  const convertedStop = item.stop && timestampToDate(item.stop);
  const { t } = useI18n("statuses");
  const status = t(item.status);

  return (
    <div className={styles["test-result-prev-status-tooltip"]}>
      <Text tag={"div"} size={"m"} bold>
        {capitalize(status)}
      </Text>
      <Text size={"m"}>{convertedStop}</Text>
    </div>
  );
};

export type TestResultPrevStatusesProps = {
  history: ClassicTestResult["history"];
};

export const TestResultPrevStatuses: FunctionalComponent<TestResultPrevStatusesProps> = ({ history }) => {
  return (
    <div className={styles["test-result-prev-statuses"]}>
      {history?.slice(0, 6).map((item, key) => (
        <div key={key} className={styles["test-result-prev-status"]}>
          <TooltipWrapper key={key} tooltipComponent={<TestResultPrevStatusTooltip item={item} />}>
            <TestResultPrevStatus item={item} />
          </TooltipWrapper>
        </div>
      ))}
    </div>
  );
};
