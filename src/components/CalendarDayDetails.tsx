import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Button, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useState } from "react";
import { CalendarOccurrence } from "../types";

const CalendarFooter = ({
  onClickReturnCallback,
  onClickAddCallback,
}: {
  onClickReturnCallback: () => void;
  onClickAddCallback: () => void;
}) => (
  <div
    style={{
      width: 300,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "0 16px",
    }}
  >
    <div className="backToCalendarButton" onClick={onClickReturnCallback}>
      <ArrowBackIcon style={{ marginRight: 6 }} fontSize="small" /> Back
    </div>
    <AddIcon
      className="addCalendarOccurrenceButton"
      onClick={onClickAddCallback}
    />
  </div>
);

export function CalendarDayDetails({
  dateOccurences,
  onClickReturnCallback,
  insertOccurrenceCallback,
}: {
  dateOccurences: CalendarOccurrence[];
  onClickReturnCallback: () => void;
  insertOccurrenceCallback: (time: Dayjs, description: string) => Promise<void>;
}) {
  const [insertMode, setInsertMode] = useState(false);
  const [{ time, description }, setOccurrenceToBeInserted] = useState<{
    time?: Dayjs;
    description?: string;
  }>({});

  const toggleInsertMode = () => {
    setInsertMode((prevState) => !prevState);
  };

  if (insertMode) {
    return (
      <div style={{ width: 300, padding: 16 }}>
        <TextField
          label="Description"
          fullWidth
          multiline
          required
          rows={2}
          value={description}
          onChange={(e) =>
            setOccurrenceToBeInserted((prevState) => ({
              ...prevState,
              description: e.target.value,
            }))
          }
          style={{ marginBottom: 8 }}
        />
        <TimePicker
          label="Time"
          onChange={(value) =>
            setOccurrenceToBeInserted((prevState) => ({
              ...prevState,
              time: value,
            }))
          }
          value={time}
          slotProps={{
            textField: {
              required: true,
              fullWidth: true,
              style: { marginTop: 16 },
            },
          }}
        />
        <div style={{ float: "right", marginTop: 24 }}>
          <Button
            variant="contained"
            size="small"
            color="error"
            style={{ marginRight: 16 }}
            onClick={() => {
              toggleInsertMode();
              setOccurrenceToBeInserted({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={!time || !description}
            onClick={async () => {
              await insertOccurrenceCallback(time!, description!);
              toggleInsertMode();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    );
  }

  if (dateOccurences.length) {
    return (
      <>
        <ul>
          {dateOccurences.map((item) => {
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
        <CalendarFooter
          onClickReturnCallback={onClickReturnCallback}
          onClickAddCallback={toggleInsertMode}
        />
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
        <CalendarFooter
          onClickReturnCallback={onClickReturnCallback}
          onClickAddCallback={toggleInsertMode}
        />
      </>
    );
  }
}
