import { Modal, TextField } from "@mui/material";
import { useState } from "react";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";

export type ChangePasswordModalProps = {
  isOpen: boolean;
  handleClose: () => void;
};

export default function ChangePasswordModal({
  isOpen,
  handleClose,
}: ChangePasswordModalProps) {
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const { triggerToast: triggerToastError } = useToaster({ type: "error" });
  const { triggerToast: triggerToastSuccess } = useToaster({ type: "success" });

  const submitForm = async () => {
    try {
      await httpCallers.post(`/user/change-password?newPassword=${password}`);
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
        <button
          type="submit"
          className="primary"
          style={{ width: 150 }}
          onClick={submitForm}
          disabled={
            !password || !confirmPassword || password !== confirmPassword
          }
        >
          Update
        </button>
      </div>
    </Modal>
  );
}
