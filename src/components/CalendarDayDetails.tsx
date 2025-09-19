import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Button, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import { useCallback, useState } from "react";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
import { useOrganizationInfoStore, useUserInfoStore } from "../store";
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
  updateOccurrenceCallback,
}: {
  dateOccurences: CalendarOccurrence[];
  refetchDateOccurrences: () => Promise<void>;
  onClickReturnCallback: () => void;
  insertOccurrenceCallback: (
    doctorId: string,
    patientId: string,
    time: Dayjs,
    description: string
  ) => Promise<void>;
  updateOccurrenceCallback: (
    doctorId: string,
    id: string,
    time: Dayjs,
    description: string
  ) => Promise<void>;
}) {
  const userInfoStore = useUserInfoStore();
  const organizationInfoStore = useOrganizationInfoStore();

  const [status, setStatus] = useState<"idle" | "update" | "insert">();
  const [occurrenceBeingManaged, setOccurrenceBeingManaged] = useState<{
    id?: string;
    doctorId?: string;
    patientId?: string;
    time?: Dayjs;
    description?: string;
  }>({});

  const { triggerToast: triggerErrorToast } = useToaster({ type: "error" });
  const { triggerToast: triggerSuccessToast } = useToaster({ type: "success" });

  const deleteOccurrence = useCallback(async (id: string) => {
    try {
      await httpCallers.delete(`/calendar/occurrences/${id}`);
      await refetchDateOccurrences();
      triggerSuccessToast();
    } catch {
      triggerErrorToast();
    }
  }, []);

  if (status === "insert" || status === "update") {
    return (
      <div style={{ width: 300, padding: 16 }}>
        {userInfoStore.data.role === "support" && (
          <>
            <InputLabel id="doctor-select-label">Doctor</InputLabel>
            <Select
              labelId="doctor-select-label"
              value={occurrenceBeingManaged.doctorId || ""}
              label="Doctor"
              onChange={(e) =>
                setOccurrenceBeingManaged((prevState) => ({
                  ...prevState,
                  doctorId: e.target.value,
                }))
              }
              required
              fullWidth
              style={{ marginBottom: 16 }}
            >
              {organizationInfoStore.data.doctors?.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.fullname}
                </MenuItem>
              ))}
            </Select>
          </>
        )}
        <InputLabel id="patient-select-label">Patient</InputLabel>
        <Select
          disabled={
            userInfoStore.data.role === "support" &&
            !occurrenceBeingManaged.doctorId
          }
          labelId="patient-select-label"
          value={occurrenceBeingManaged.patientId || ""}
          label="Patient"
          onChange={(e) =>
            setOccurrenceBeingManaged((prevState) => ({
              ...prevState,
              patientId: e.target.value,
            }))
          }
          required
          fullWidth
          style={{ marginBottom: 16 }}
        >
          {organizationInfoStore.data.doctors
            .filter((item) =>
              userInfoStore.data.role === "doctor"
                ? item.id === userInfoStore.data.id
                : item.id === occurrenceBeingManaged.doctorId
            )
            .reduce(
              (acc, doctor) => {
                acc.push(...doctor.patients);
                return acc;
              },
              [] as { id: string; fullname: string }[]
            )
            ?.map((patient) => (
              <MenuItem key={patient.id} value={patient.id}>
                {patient.fullname}
              </MenuItem>
            ))}
        </Select>
        <TextField
          label="Description"
          fullWidth
          multiline
          required
          rows={2}
          value={occurrenceBeingManaged.description}
          onChange={(e) =>
            setOccurrenceBeingManaged((prevState) => ({
              ...prevState,
              description: e.target.value,
            }))
          }
          style={{ marginBottom: 8 }}
        />
        <TimePicker
          label="Time"
          onChange={(value) =>
            setOccurrenceBeingManaged((prevState) => ({
              ...prevState,
              time: value,
            }))
          }
          value={occurrenceBeingManaged.time}
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
              setStatus("idle");
              setOccurrenceBeingManaged({});
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={
              !occurrenceBeingManaged.time ||
              !occurrenceBeingManaged.description ||
              (userInfoStore.data.role === "support" &&
                !occurrenceBeingManaged.doctorId) ||
              !occurrenceBeingManaged.patientId ||
              (status === "update" && !occurrenceBeingManaged.id)
            }
            onClick={async () => {
              status === "insert"
                ? await insertOccurrenceCallback(
                    userInfoStore.data.role === "support"
                      ? occurrenceBeingManaged.doctorId!
                      : userInfoStore.data.id,
                    occurrenceBeingManaged.patientId!,
                    occurrenceBeingManaged.time!,
                    occurrenceBeingManaged.description!
                  )
                : await updateOccurrenceCallback(
                    userInfoStore.data.role === "support"
                      ? occurrenceBeingManaged.doctorId!
                      : userInfoStore.data.id,
                    occurrenceBeingManaged.id!,
                    occurrenceBeingManaged.time!,
                    occurrenceBeingManaged.description!
                  );
              setStatus("idle");
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
                    onClick={() => {
                      setOccurrenceBeingManaged({
                        id: item.id,
                        doctorId: item.userId,
                        time: dayjs(item.datetime),
                        description: item.description,
                      });
                      setStatus("update");
                    }}
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
          onClickAddCallback={() => setStatus("insert")}
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
          onClickAddCallback={() => setStatus("insert")}
        />
      </div>
    );
  }
}
