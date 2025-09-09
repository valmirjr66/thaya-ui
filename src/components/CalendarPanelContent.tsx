import { Badge } from "@mui/material";
import {
  DateCalendar,
  DayCalendarSkeleton,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import closeIcon from "../imgs/ic-close.svg";
import httpCallers from "../service";
import { CalendarOccurrence } from "../types";
import {
  mapMonthNumberToAbbreviation,
  mapMonthNumberToCapitalizedAbbreviation,
} from "../util/DateHelper";
import { CalendarDayDetails } from "./CalendarDayDetails";

interface CalendarPanelProps {
  closePanel: () => void;
}

function ServerDay(
  props: PickersDayProps & {
    occurrences?: CalendarOccurrence[];
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

export default function CalendarPanelContent({
  closePanel,
}: CalendarPanelProps) {
  const requestAbortController = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [occurrences, setOccurrences] = useState<CalendarOccurrence[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [{ month, year }, setCurrentMonthYear] = useState<{
    month: number;
    year: number;
  }>({
    month: dayjs().month(),
    year: dayjs().year(),
  });

  const selectedDate = useMemo<Dayjs | null>(
    () =>
      (selectedDay &&
        month &&
        year &&
        dayjs().year(year).month(month).date(selectedDay)) ||
      null,
    [selectedDay, month, year]
  );

  const fetchHighlightedDays = async (date: Dayjs) => {
    setIsLoading(true);
    setOccurrences([]);

    const controller = new AbortController();

    try {
      controller.signal.onabort = () => {
        throw new DOMException("aborted", "AbortError");
      };

      const yearToFetch = date.year();
      const monthToFetch = mapMonthNumberToAbbreviation(date.month() + 1);

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

    setCurrentMonthYear({ month: date.month(), year: date.year() });
    fetchHighlightedDays(date);
  };

  const insertOccurrenceCallback = async (time: Dayjs, description: string) => {
    const composedDate = selectedDate
      .hour(time.hour())
      .minute(time.minute())
      .second(0)
      .millisecond(0);

    await httpCallers.post("/user/calendar", {
      datetime: composedDate.toISOString(),
      description,
    });

    fetchHighlightedDays(selectedDate);
    setSelectedDay(null);
  };

  return (
    <div className="panelWrapper">
      <div className="panelHeader">
        <div>
          <span style={{ marginLeft: 16 }}>Calendar</span>
          <span style={{ fontSize: 12, marginLeft: 4, color: "#efefef" }}>
            {selectedDay &&
              ` (${mapMonthNumberToCapitalizedAbbreviation(
                month
              )} ${selectedDay}, ${year.toString()})`}
          </span>
        </div>
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
        <CalendarDayDetails
          insertOccurrenceCallback={insertOccurrenceCallback}
          dateOccurences={occurrences.filter(
            (item) => new Date(item.datetime).getUTCDate() === selectedDay
          )}
          onClickReturnCallback={() => setSelectedDay(null)}
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
