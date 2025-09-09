import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Button, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { useCallback, useState } from "react";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
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
  refetchDateOccurrences,
  onClickReturnCallback,
  insertOccurrenceCallback,
}: {
  dateOccurences: CalendarOccurrence[];
  refetchDateOccurrences: () => Promise<void>;
  onClickReturnCallback: () => void;
  insertOccurrenceCallback: (time: Dayjs, description: string) => Promise<void>;
}) {
  const [insertMode, setInsertMode] = useState(false);
  const [{ time, description }, setOccurrenceToBeInserted] = useState<{
    time?: Dayjs;
    description?: string;
  }>({});

  const { triggerToast: triggerErrorToast } = useToaster({ type: "error" });
  const { triggerToast: triggerSuccessToast } = useToaster({ type: "success" });

  const toggleInsertMode = () => {
    setInsertMode((prevState) => !prevState);
  };

  const deleteOccurrence = useCallback(async (id: string) => {
    try {
      await httpCallers.delete(`/calendar/occurrences/${id}`);
      await refetchDateOccurrences();
      triggerSuccessToast();
    } catch {
      triggerErrorToast();
    }
  }, []);

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
            onClick={async () => {
              await refetchDateOccurrences();
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
      <div
        style={{
          marginTop: 16,
          marginBottom: 16,
          width: 320,
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          {dateOccurences.map((item) => {
            const date = new Date(item.datetime);
            const hours = String(date.getUTCHours()).padStart(2, "0");
            const minutes = String(date.getUTCMinutes()).padStart(2, "0");

            const formattedDatetime = `${hours}h${minutes}`;

            return (
              <div
                key={item.id}
                style={{
                  padding: "16px 16px 0px 16px",
                  width: 288,
                  fontSize: 12,
                }}
              >
                <div
                  style={{
                    borderBottom: "1px solid #ffffff36",
                    width: "100%",
                    display: "flex",
                    justifyContent: "start",
                    alignItems: "center",
                    paddingBottom: 8,
                  }}
                >
                  <DeleteIcon
                    style={{ marginRight: 4, fontSize: 16 }}
                    className="closeIcon"
                    onClick={() => deleteOccurrence(item.id)}
                  />
                  <EditIcon
                    style={{ marginRight: 4, fontSize: 16 }}
                    className="editIcon"
                    onClick={() => console.log(item.id)}
                  />
                  <div style={{ marginLeft: 4 }}>({formattedDatetime})</div>
                  <div style={{ marginLeft: 8 }}>{item.description}</div>
                </div>
              </div>
            );
          })}
        </div>
        <CalendarFooter
          onClickReturnCallback={onClickReturnCallback}
          onClickAddCallback={toggleInsertMode}
        />
      </div>
    );
  } else {
    return (
      <div
        style={{
          width: 320,
          marginTop: 16,
          marginBottom: 16,
          minHeight: 300,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ height: 200, display: "flex", alignItems: "center" }}>
          <span
            style={{
              textAlign: "center",
              fontSize: 12,
              display: "block",
              width: "100%",
            }}
          >
            Nothing to show
          </span>
        </div>
        <CalendarFooter
          onClickReturnCallback={onClickReturnCallback}
          onClickAddCallback={toggleInsertMode}
        />
      </div>
    );
  }
}
