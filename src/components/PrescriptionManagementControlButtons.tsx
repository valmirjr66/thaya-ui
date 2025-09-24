import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import UploadIcon from "@mui/icons-material/Upload";
import { Button, IconButton } from "@mui/material";
import { RefObject } from "react";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
import { PrescriptionStatus } from "../types";

const prescriptionsStorageBaseAddress = import.meta.env
  .VITE_PRESCRIPTIONS_STORAGE_BASE_ADDRESS;

const PrescriptionManagementControlButtons = ({
  prescriptionId,
  status,
  fileInputRefPrescription,
  reloadRecords,
  fileName,
}: {
  prescriptionId: string;
  status: PrescriptionStatus;
  fileInputRefPrescription: RefObject<HTMLInputElement>;
  reloadRecords: () => Promise<void>;
  fileName: string;
}) => {
  const { triggerToast: triggerSuccessToast } = useToaster({ type: "success" });
  const { triggerToast: triggerErrorToast } = useToaster({ type: "error" });

  const handleDeletePrescription = async () => {
    try {
      await httpCallers.delete(`prescriptions/${prescriptionId}`);
      triggerSuccessToast("Prescription deleted successfully");
      reloadRecords();
    } catch (error) {
      triggerErrorToast("Failed to delete prescription");
    }
  };

  const handleUploadPrescription = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileInputRefPrescription.current?.files[0]);
      await httpCallers.put(`prescriptions/${prescriptionId}/file`, formData, {
        "Content-Type": "multipart/form-data",
      });
      triggerSuccessToast("Prescription uploaded successfully");
      reloadRecords();
    } catch (error) {
      triggerErrorToast("Failed to upload prescription");
    }
  };

  const handleErasePrescription = async () => {
    try {
      await httpCallers.delete(`prescriptions/${prescriptionId}/file`);
      triggerSuccessToast("Prescription erased successfully");
      reloadRecords();
    } catch (error) {
      triggerErrorToast("Failed to erase prescription");
    }
  };

  const handleUpdatePrescriptionStatus = async (
    prescriptionId: string,
    newStatus: PrescriptionStatus
  ) => {
    try {
      await httpCallers.patch(
        `prescriptions/${prescriptionId}/mark-as-${newStatus}`,
        {
          status: newStatus,
        }
      );
      triggerSuccessToast("Prescription status updated successfully");
      reloadRecords();
    } catch (error) {
      triggerErrorToast("Failed to update prescription status");
    }
  };

  const handleDownloadPrescription = async () => {
    const url = `${prescriptionsStorageBaseAddress}/${fileName}`;
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleGenerateSummary = async () => {
    try {
      await httpCallers.patch(
        `prescriptions/${prescriptionId}/generate-summary`
      );
      triggerSuccessToast("Summary generated successfully");
      reloadRecords();
    } catch (error) {
      triggerErrorToast("Failed to generate summary");
    }
  };

  let changeStatusButton: React.ReactElement;

  if (status === "draft") {
    changeStatusButton = (
      <Button
        size="small"
        variant="contained"
        onClick={() => handleUpdatePrescriptionStatus(prescriptionId, "ready")}
      >
        MARK READY
      </Button>
    );
  } else if (status === "ready") {
    changeStatusButton = (
      <div>
        <Button
          size="small"
          variant="contained"
          onClick={() => handleUpdatePrescriptionStatus(prescriptionId, "sent")}
          style={{ marginRight: 16 }}
        >
          SEND
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() =>
            handleUpdatePrescriptionStatus(prescriptionId, "cancelled")
          }
        >
          CANCEL
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {changeStatusButton}
      {
        <div>
          <input
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            ref={fileInputRefPrescription}
            onChange={() => handleUploadPrescription()}
          />
          <IconButton
            title="AI: Summary"
            onClick={() => handleGenerateSummary()}
            disabled={status !== "draft" || !fileName}
          >
            <AutoAwesomeIcon
              fontSize="small"
              color={status !== "draft" || !fileName ? "disabled" : "primary"}
            />
          </IconButton>
          <IconButton
            title="Delete"
            onClick={() => handleDeletePrescription()}
            disabled={status !== "draft"}
          >
            <DeleteIcon
              fontSize="small"
              color={status !== "draft" ? "disabled" : "error"}
            />
          </IconButton>
          <IconButton
            title="Upload"
            onClick={() => fileInputRefPrescription.current?.click()}
            disabled={status !== "draft"}
          >
            <UploadIcon
              fontSize="small"
              color={status !== "draft" ? "disabled" : "primary"}
            />
          </IconButton>
          <IconButton
            title="Erase"
            onClick={() => handleErasePrescription()}
            disabled={status !== "draft" || !fileName}
          >
            <LinkOffIcon
              fontSize="small"
              color={status !== "draft" || !fileName ? "disabled" : "primary"}
            />
          </IconButton>
          <IconButton
            title="Download"
            onClick={() => handleDownloadPrescription()}
            disabled={!fileName}
          >
            <DownloadIcon
              fontSize="small"
              color={fileName ? "primary" : "disabled"}
            />
          </IconButton>
        </div>
      }
    </div>
  );
};

export default PrescriptionManagementControlButtons;
