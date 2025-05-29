import { TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import useToaster from "../hooks/useToaster";
import chatIcon from "../imgs/ic-chat.svg";
import httpCallers from "../service";

export default function ChangePassword() {
  const navigate = useNavigate();

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
    }
  };

  return (
    <>
      <ToastContainer />
      <main className="app">
        <header
          className="appHeader"
          style={{
            justifyContent: "end",
          }}
        >
          <img
            src={chatIcon}
            alt="Chat"
            width={25}
            style={{
              marginRight: 25,
            }}
            className="chatIcon"
            onClick={() => navigate("/")}
          />
        </header>
        <div className="appWrapper">
          <section className="settingsContent">
            <div className="settingsPanel">
              <TextField
                label="Password"
                value={password}
                fullWidth
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
              <TextField
                label="Confirm password"
                value={confirmPassword}
                fullWidth
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
              />
              <span style={{ color: "salmon" }}>
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
              >
                Update
              </button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
