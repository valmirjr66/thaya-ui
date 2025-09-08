import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { CalendarOccurrence } from "../types";

const BackToCalendarPanel = ({
  onClickCallback,
}: {
  onClickCallback: () => void;
}) => (
  <div className="backToCalendarButton" onClick={onClickCallback}>
    <ArrowBackIcon style={{ marginRight: 6 }} fontSize="small" /> Back
  </div>
);

export function CalendarDayDetails({
  dayOccurences,
  onClickBackCallback,
}: {
  dayOccurences: CalendarOccurrence[];
  onClickBackCallback: () => void;
}) {
  if (dayOccurences.length) {
    return (
      <>
        <ul>
          {dayOccurences.map((item) => {
            const date = new Date(item.datetime);
            const year = String(date.getUTCFullYear()).slice(-2);
            const month = String(date.getUTCMonth() + 1).padStart(2, "0");
            const day = String(date.getUTCDate()).padStart(2, "0");
            const hours = String(date.getUTCHours()).padStart(2, "0");
            const minutes = String(date.getUTCMinutes()).padStart(2, "0");

            const formattedDatetime = `${day}/${month}/${year} ${hours}h${minutes}`;

            return (
              <li
                key={item.datetime}
                style={{ margin: 8, width: 300, fontSize: 12 }}
              >
                {`(${formattedDatetime}) ${item.description}`}
              </li>
            );
          })}
        </ul>
        <BackToCalendarPanel onClickCallback={onClickBackCallback} />
      </>
    );
  } else {
    return (
      <>
        <span
          style={{ width: 300, margin: 32, textAlign: "center", fontSize: 12 }}
        >
          Nothing to show
        </span>
        <BackToCalendarPanel onClickCallback={onClickBackCallback} />
      </>
    );
  }
}
