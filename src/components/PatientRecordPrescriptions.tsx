import { useCallback, useRef, useState } from "react";
import { PatientRecord, Prescription, PrescriptionStatus } from "../types";
import { formatDate } from "../util/DateHelper";
import PrescriptionManagementControlButtons from "./PrescriptionManagementControlButtons";
import httpCallers from "../service";
import useToaster from "../hooks/useToaster";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Save from "@mui/icons-material/Save";
import UndoIcon from "@mui/icons-material/Undo";

export default function PatientRecordPrescriptions({
  prescriptions,
  doctorId,
  patientId,
  reloadRecords,
}: {
  prescriptions: Prescription[];
  doctorId: string;
  patientId: string;
  reloadRecords: () => Promise<void>;
}) {
  const fileInputRefPrescription = useRef<HTMLInputElement>(null);

  const { triggerToast: triggerErrorToast } = useToaster({ type: "error" });
  const { triggerToast: triggerSuccessToast } = useToaster({ type: "success" });

  const handleInsertPrescription = useCallback(async () => {
    try {
      await httpCallers.post(`prescriptions`, {
        doctorId: doctorId,
        patientId: patientId,
      });

      triggerSuccessToast("Prescription inserted successfully");
      await reloadRecords();
    } catch (error) {
      triggerErrorToast("Failed to insert prescription");
    }
  }, [
    doctorId,
    patientId,
    reloadRecords,
    triggerErrorToast,
    triggerSuccessToast,
  ]);

  const [internalPrescriptions, setInternalPrescriptions] = useState<
    Record<string, Prescription>
  >(
    prescriptions.reduce(
      (acc, prescription) => {
        acc[prescription.id] = prescription;
        return acc;
      },
      {} as Record<string, Prescription>
    )
  );

  const mapPrescriptionStatusToColor: { [key in PrescriptionStatus]: string } =
    {
      draft: "gray",
      ready: "green",
      sent: "blue",
      cancelled: "red",
    };

  const handleSaveSummary = useCallback(
    async (prescriptionId: string) => {
      try {
        await httpCallers.put(`prescriptions/${prescriptionId}`, {
          summary: internalPrescriptions[prescriptionId].summary,
        });
        triggerSuccessToast("Summary saved successfully");
        await reloadRecords();
      } catch (error) {
        triggerErrorToast("Failed to save summary");
      }
    },
    [
      internalPrescriptions,
      reloadRecords,
      triggerErrorToast,
      triggerSuccessToast,
    ]
  );

  return (
    <div>
      <div
        style={{
          fontWeight: "bold",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Prescriptions
        <IconButton title="Add Prescription" onClick={handleInsertPrescription}>
          <AddIcon color="primary" />
        </IconButton>
      </div>
      <div>
        {prescriptions.map((prescription) => (
          <div
            key={prescription.id}
            style={{
              marginBottom: 40,
              borderTop: "1px solid gray",
              paddingTop: 16,
            }}
          >
            <PrescriptionManagementControlButtons
              prescriptionId={prescription.id}
              status={prescription.status}
              fileInputRefPrescription={fileInputRefPrescription}
              reloadRecords={reloadRecords}
              fileName={prescription.fileName}
            />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #ccc",
                padding: "16px 16px",
                borderRadius: 4,
                height: 100,
                borderTop: `10px solid ${mapPrescriptionStatusToColor[prescription.status]}`,
                marginTop: 8,
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={3}
                value={internalPrescriptions[prescription.id].summary}
                onChange={(e) => {
                  setInternalPrescriptions((prevState) => ({
                    ...prevState,
                    [prescription.id]: {
                      ...prevState[prescription.id],
                      summary: e.target.value,
                    },
                  }));
                }}
                disabled={
                  prescription.status !== "draft" &&
                  prescription.status !== "ready"
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        {prescription.summary !==
                          internalPrescriptions[prescription.id].summary && (
                          <>
                            <IconButton title="Save">
                              <Save
                                onClick={() =>
                                  handleSaveSummary(prescription.id)
                                }
                              />
                            </IconButton>
                            <IconButton title="Undo" style={{ marginLeft: 8 }}>
                              <UndoIcon
                                onClick={() =>
                                  setInternalPrescriptions((prevState) => ({
                                    ...prevState,
                                    [prescription.id]: prescription,
                                  }))
                                }
                              />
                            </IconButton>
                          </>
                        )}
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              <div>
                Created at: {formatDate(new Date(prescription.createdAt))}
              </div>
              <div>
                Updated at: {formatDate(new Date(prescription.updatedAt))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
