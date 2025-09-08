import { Badge } from "@mui/material";
import {
  DateCalendar,
  DayCalendarSkeleton,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import closeIcon from "../imgs/ic-close.svg";
import httpCallers from "../service";
import { mapMonthNumberToItsAbbreviation } from "../util/DateHelper";

interface CalendarPanelProps {
  closePanel: () => void;
}

type Occurrence = {
  datetime: string;
  description: string;
};

function ServerDay(
  props: PickersDayProps & {
    occurrences?: Occurrence[];
    setSelectedDay: (day: number) => void;
  }
) {
  const {
    occurrences = [],
    setSelectedDay,
    day,
    outsideCurrentMonth,
    ...other
  } = props;

  const occurrencesOfTheDay = occurrences.filter(
    (item) => new Date(item.datetime).getUTCDate() === props.day.date()
  );

  const isHighlighted =
    !props.outsideCurrentMonth && occurrencesOfTheDay.length;

  return (
    <Badge
      key={props.day.toString()}
      color="secondary"
      variant="dot"
      overlap="circular"
      invisible={!isHighlighted}
    >
      <PickersDay
        {...other}
        onClick={() => setSelectedDay(props.day.date())}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
}

function DayDetails(props: { dayOccurences: Occurrence[] }) {
  const { dayOccurences } = props;

  if (dayOccurences.length) {
    return (
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
    );
  } else {
    return (
      <span
        style={{ width: 300, margin: 32, textAlign: "center", fontSize: 12 }}
      >
        Nothing to show
      </span>
    );
  }
}

export default function CalendarPanelContent({
  closePanel,
}: CalendarPanelProps) {
  const requestAbortController = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>();

  const fetchHighlightedDays = async (date: Dayjs) => {
    setIsLoading(true);
    setOccurrences([]);

    const controller = new AbortController();

    try {
      controller.signal.onabort = () => {
        throw new DOMException("aborted", "AbortError");
      };

      const yearToFetch = date.year();
      const monthToFetch = mapMonthNumberToItsAbbreviation(date.month() + 1);

      const { data } = await httpCallers.get(
        `/user/calendar?year=${yearToFetch}&month=${monthToFetch}`
      );

      setOccurrences(data.items || []);
      setIsLoading(false);
    } catch (error) {
      if (error.name !== "AbortError") {
        throw error;
      }
    }

    requestAbortController.current = controller;
  };

  useEffect(() => {
    fetchHighlightedDays(dayjs());
    return () => requestAbortController.current?.abort();
  }, []);

  const handleMonthChange = (date: Dayjs) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }

    fetchHighlightedDays(date);
  };

  return (
    <div className="panelWrapper">
      <div className="panelHeader">
        <span style={{ marginLeft: 16 }}>Calendar</span>
        <img
          src={closeIcon}
          className="closeIcon"
          alt="Close calendar"
          width={20}
          style={{ marginRight: 16 }}
          onClick={closePanel}
        />
      </div>
      {selectedDay ? (
        <DayDetails
          dayOccurences={occurrences.filter(
            (item) => new Date(item.datetime).getUTCDate() === selectedDay
          )}
        />
      ) : (
        <DateCalendar
          loading={isLoading}
          onMonthChange={handleMonthChange}
          renderLoading={() => <DayCalendarSkeleton />}
          slots={{
            day: ServerDay,
          }}
          slotProps={{
            day: {
              occurrences,
              setSelectedDay,
            } as any,
          }}
        />
      )}
    </div>
  );
}
