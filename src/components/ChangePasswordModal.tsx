import { Button, Modal, TextField } from "@mui/material";
import { useState } from "react";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
import { useUserInfoStore } from "../store";

export type ChangePasswordModalProps = {
  isOpen: boolean;
  handleClose: () => void;
};

export default function ChangePasswordModal({
  isOpen,
  handleClose,
}: ChangePasswordModalProps) {
  const { data: userInfoData } = useUserInfoStore();

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { triggerToast: triggerToastError } = useToaster({ type: "error" });
  const { triggerToast: triggerToastSuccess } = useToaster({ type: "success" });
  const userInfoStore = useUserInfoStore();

  const submitForm = async () => {
    try {
      await httpCallers.post(
        `/${userInfoData.role}-users/change-password?userEmail=${userInfoStore.data.email}&newPassword=${password}`
      );
      triggerToastSuccess("Password updated successfully!");
    } catch {
      triggerToastError();
    } finally {
      handleCloseInternal();
    }
  };

  const handleCloseInternal = () => {
    handleClose();
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <Modal open={isOpen} onClose={handleCloseInternal}>
      <div className="passwordPanel">
        <TextField
          label="Password"
          value={password}
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          style={{ marginBottom: 24 }}
        />
        <TextField
          label="Confirm password"
          value={confirmPassword}
          fullWidth
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          style={{ marginBottom: 24 }}
        />
        <span style={{ color: "salmon", marginBottom: 16 }}>
          {password &&
            confirmPassword &&
            password !== confirmPassword &&
            "Passwords don't match"}
        </span>
        <Button
          variant="contained"
          color="success"
          onClick={submitForm}
          disabled={
            !password || !confirmPassword || password !== confirmPassword
          }
        >
          Update
        </Button>
      </div>
    </Modal>
  );
}
