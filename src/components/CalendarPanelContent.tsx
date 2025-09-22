import { Badge } from "@mui/material";
import {
  DateCalendar,
  DayCalendarSkeleton,
  PickersDay,
  PickersDayProps,
} from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useToaster from "../hooks/useToaster";
import closeIcon from "../imgs/ic-close.svg";
import httpCallers from "../service";
import { CalendarOccurrence } from "../types";
import {
  mapMonthNumberToAbbreviation,
  mapMonthNumberToCapitalizedAbbreviation,
} from "../util/DateHelper";
import { CalendarDayDetails } from "./CalendarDayDetails";

interface CalendarPanelProps {
  closePanel?: () => void;
  userIds: string[];
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
  userIds,
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

  const { triggerToast } = useToaster({ type: "error" });

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
      const monthToFetch = mapMonthNumberToAbbreviation(date.month());

      let fetchedOccurrences: CalendarOccurrence[] = [];

      for (const userId of userIds) {
        const { data } = await httpCallers.get(
          `/calendar/occurrences?userId=${userId}&year=${yearToFetch}&month=${monthToFetch}`
        );

        fetchedOccurrences = [
          ...fetchedOccurrences,
          ...(data.items.map((item) => ({ ...item, userId })) || []),
        ];
      }

      setOccurrences(fetchedOccurrences);
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
  }, [userIds]);

  const handleMonthChange = (date: Dayjs) => {
    if (requestAbortController.current) {
      requestAbortController.current.abort();
    }

    setCurrentMonthYear({ month: date.month(), year: date.year() });
    fetchHighlightedDays(date);
  };

  const getComposedDate = useCallback(
    (time: Dayjs) =>
      selectedDate
        .hour(time.hour())
        .minute(time.minute())
        .second(0)
        .millisecond(0),
    [selectedDate]
  );

  const insertOccurrenceCallback = useCallback(
    async (
      userId: string,
      patientId: string,
      time: Dayjs,
      description: string
    ) => {
      const composedDate = getComposedDate(time);

      try {
        await httpCallers.post("/calendar/occurrences", {
          datetime: composedDate.toISOString(),
          description,
          userId,
          patientId,
        });

        fetchHighlightedDays(selectedDate);
        setSelectedDay(null);
      } catch {
        triggerToast();
      }
    },
    [
      selectedDate,
      triggerToast,
      fetchHighlightedDays,
      setSelectedDay,
      getComposedDate,
    ]
  );

  const updateOccurrenceCallback = useCallback(
    async (userId: string, id: string, time: Dayjs, description: string) => {
      const composedDate = getComposedDate(time);

      try {
        await httpCallers.put(`/calendar/occurrences/${id}`, {
          datetime: composedDate.toISOString(),
          description,
          userId,
        });

        fetchHighlightedDays(selectedDate);
        setSelectedDay(null);
      } catch {
        triggerToast();
      }
    },
    [
      selectedDate,
      triggerToast,
      fetchHighlightedDays,
      setSelectedDay,
      getComposedDate,
    ]
  );

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
        {closePanel && (
          <img
            src={closeIcon}
            className="pointer goRedPointer"
            alt="Close calendar"
            width={20}
            style={{ marginRight: 16 }}
            onClick={closePanel}
          />
        )}
      </div>
      {selectedDay ? (
        <CalendarDayDetails
          insertOccurrenceCallback={insertOccurrenceCallback}
          updateOccurrenceCallback={updateOccurrenceCallback}
          dateOccurences={occurrences.filter(
            (item) => new Date(item.datetime).getUTCDate() === selectedDay
          )}
          onClickReturnCallback={() => setSelectedDay(null)}
          refetchDateOccurrences={() => fetchHighlightedDays(selectedDate!)}
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
