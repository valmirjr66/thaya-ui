import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { Button, IconButton, MenuItem, Select, TextField } from "@mui/material";
import { LineChart } from "@mui/x-charts/LineChart";
import dayjs from "dayjs";
import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
import { PatientRecord, SeriesType } from "../types";
import PatientRecordPrescriptions from "./PatientRecordPrescriptions";

const SERIES_TYPES_DISPLAY_NAMES: { [key in SeriesType]: string } = {
  "blood-pressure-systolic": "Blood Pressure (Systolic)",
  "blood-pressure-diastolic": "Blood Pressure (Diastolic)",
  "heart-rate": "Heart Rate",
  weight: "Weight",
  custom: "Custom",
};

export default function PatientRecordView({
  patientRecord,
  reloadRecords,
}: {
  patientRecord: PatientRecord;
  reloadRecords: () => Promise<void>;
}) {
  const { triggerToast: triggerErrorToast } = useToaster({ type: "error" });
  const { triggerToast: triggerSuccessToast } = useToaster({ type: "success" });

  const [selectedSeriesIds, setSelectedSeriesIds] = useState<string[]>([]);
  const [newPatientRecord, setNewPatientRecord] =
    useState<Omit<PatientRecord, "id" | "doctorId" | "patientId" | "series">>(
      patientRecord
    );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await httpCallers.put(`patient-records/${patientRecord.id}`, {
        summary: newPatientRecord.summary,
        content: newPatientRecord.content,
      });
      triggerSuccessToast("Patient record saved successfully");
      setIsEditing(false);
      await reloadRecords();
    } catch (error) {
      triggerErrorToast("Failed to save patient record");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      await httpCallers.patch(
        `patient-records/${patientRecord.id}/generate-summary`,
        {}
      );
      await reloadRecords();
      triggerSuccessToast("Summary generated successfully");
    } catch (error) {
      triggerErrorToast("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  return isSaving ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      Saving...
    </div>
  ) : (
    <div style={{ padding: 8 }}>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: "bold" }}>Patient:</span>&nbsp;
        {patientRecord.patientName}
        {isEditing ? (
          <div>
            <IconButton
              title="Save"
              onClick={() => {
                setIsEditing(false);
                handleSave();
              }}
            >
              <SaveIcon fontSize="small" color="success" />
            </IconButton>
            <IconButton title="Cancel" onClick={() => setIsEditing(false)}>
              <CancelIcon fontSize="small" color="error" />
            </IconButton>
          </div>
        ) : (
          <IconButton
            title="Edit"
            onClick={() => {
              setNewPatientRecord(patientRecord);
              setIsEditing(true);
            }}
          >
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
        )}
      </div>
      <div style={{ marginBottom: 16, textAlign: "justify" }}>
        <div style={{ marginBottom: 8 }}>
          <span style={{ fontWeight: "bold" }}>Summary:</span>{" "}
          {!isEditing && (
            <Button
              startIcon={<AutoAwesomeIcon />}
              size="small"
              variant="outlined"
              onClick={handleGenerateSummary}
              loading={isGeneratingSummary}
            >
              AI: Summary
            </Button>
          )}
        </div>
        <div>
          {isEditing ? (
            <TextField
              multiline
              style={{ width: "100%", margin: "8px 0" }}
              value={newPatientRecord.summary}
              onChange={(e) =>
                setNewPatientRecord((prevState) => ({
                  ...prevState,
                  summary: e.target.value,
                }))
              }
            />
          ) : isGeneratingSummary ? (
            "Generating summary..."
          ) : (
            patientRecord.summary
          )}
        </div>
      </div>
      {isEditing ? (
        <TextField
          multiline
          style={{ width: "100%", margin: "8px 0" }}
          value={newPatientRecord.content}
          onChange={(e) =>
            setNewPatientRecord((prevState) => ({
              ...prevState,
              content: e.target.value,
            }))
          }
        />
      ) : (
        <div
          style={{
            border: "1px solid #ccc",
            padding: "8px 16px",
            margin: "8px 16px",
            borderRadius: 4,
          }}
        >
          <Markdown rehypePlugins={[remarkGfm]}>
            {patientRecord.content}
          </Markdown>
        </div>
      )}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "8px 16px",
          margin: "24px 16px",
          borderRadius: 4,
        }}
      >
        <Select
          labelId="series-type-select-label"
          multiple
          value={selectedSeriesIds}
          label="Series Types"
          onChange={(e) =>
            setSelectedSeriesIds(
              typeof e.target.value === "string"
                ? e.target.value.split(",")
                : (e.target.value as unknown as string[])
            )
          }
          fullWidth
        >
          {patientRecord.series
            .map((s) => ({
              id: s.id,
              title: s.title,
              type: s.type,
            }))
            .map((item) => (
              <MenuItem
                key={item.id}
                value={item.id}
                disabled={
                  selectedSeriesIds.length >= 2 &&
                  !selectedSeriesIds.includes(item.id)
                }
              >
                {item.title ||
                  SERIES_TYPES_DISPLAY_NAMES[item.type] ||
                  item.type}
              </MenuItem>
            ))}
        </Select>
        {(selectedSeriesIds.length && (
          <LineChart
            xAxis={[
              {
                valueFormatter: (date) => dayjs(date).format("MMM D"),
                data: patientRecord.series
                  .filter((item) => selectedSeriesIds.includes(item.id))
                  .reduce(
                    (acc, curr) => [
                      ...acc,
                      curr.records.map((r) => r.datetime),
                    ],
                    []
                  )
                  .flat()
                  .map((dt) => new Date(dt)),
              },
            ]}
            series={
              selectedSeriesIds.map((id) => {
                const series = patientRecord.series.find((s) => s.id === id);

                return {
                  data: series ? series.records.map((r) => r.value) : [],
                };
              }) as {
                data: number[];
              }[]
            }
            height={300}
          />
        )) || (
          <span
            style={{ marginTop: 16, textAlign: "center", display: "block" }}
          >
            No series selected
          </span>
        )}
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "8px 16px",
          margin: "24px 16px",
          borderRadius: 4,
        }}
      >
        <PatientRecordPrescriptions
          prescriptions={patientRecord.prescriptions}
          doctorId={patientRecord.doctorId}
          patientId={patientRecord.patientId}
          reloadRecords={reloadRecords}
        />
      </div>
    </div>
  );
}
