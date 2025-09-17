import { TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import Lottie from "lottie-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import useToaster from "../hooks/useToaster";
import loadingIcon from "../imgs/loading.gif";
import successLottie from "../lotties/success.json";
import httpCallers from "../service";
import { User } from "../types";

export default function Signup() {
  const [
    { fullname, nickname, birthdate, email, password, confirmPassword },
    setUser,
  ] = useState<
    Omit<User, "id"> & { password: string; confirmPassword: string }
  >({
    fullname: "",
    birthdate: null,
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
  });

  const [signupSuccess, setSignupSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const { triggerToast } = useToaster({ type: "error" });

  const navigate = useNavigate();

  async function submitForm() {
    setLoading(true);

    try {
      await httpCallers.post("/users", {
        fullname,
        email,
        password,
        birthdate,
        nickname,
      });

      setTimeout(() => {
        navigate("/");
      }, 3000);

      setSignupSuccess(true);
    } catch {
      triggerToast();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <ToastContainer />
      <section className="loginWrapper">
        {signupSuccess && <Lottie animationData={successLottie} loop={false} />}
        {loading && <img src={loadingIcon} width={30} />}
        {!signupSuccess && !loading && (
          <form onSubmit={submitForm} className="signupContainer">
            <TextField
              label="Fullname"
              value={fullname}
              fullWidth
              required
              onChange={(e) =>
                setUser((prevState) => ({
                  ...prevState,
                  fullname: e.target.value,
                }))
              }
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TextField
                label="Nickname"
                value={nickname}
                fullWidth
                onChange={(e) =>
                  setUser((prevState) => ({
                    ...prevState,
                    nickname: e.target.value,
                  }))
                }
                style={{ marginRight: 20 }}
              />
              <DatePicker
                label="Birthdate"
                value={birthdate && dayjs(new Date(birthdate))}
                slotProps={{ textField: { required: true } }}
                onChange={(e) =>
                  setUser((prevState) => ({
                    ...prevState,
                    birthdate: new Date(e.toISOString()),
                  }))
                }
              />
            </div>
            <TextField
              label="E-mail"
              value={email}
              required
              fullWidth
              onChange={(e) =>
                setUser((prevState) => ({
                  ...prevState,
                  email: e.target.value,
                }))
              }
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <TextField
                label="Password"
                value={password}
                fullWidth
                onChange={(e) =>
                  setUser((prevState) => ({
                    ...prevState,
                    password: e.target.value,
                  }))
                }
                style={{ marginRight: 20 }}
                type="password"
              />
              <TextField
                label="Confirm password"
                value={confirmPassword}
                fullWidth
                onChange={(e) =>
                  setUser((prevState) => ({
                    ...prevState,
                    confirmPassword: e.target.value,
                  }))
                }
                type="password"
              />
            </div>
            <span style={{ color: "salmon", marginBottom: 16 }}>
              {password &&
                confirmPassword &&
                password !== confirmPassword &&
                "Passwords don't match"}
            </span>
            <button
              disabled={
                !fullname ||
                !birthdate ||
                !email ||
                !password ||
                !confirmPassword ||
                password !== confirmPassword
              }
              className="primary"
              type="submit"
              style={{ width: 150 }}
            >
              Save
            </button>
          </form>
        )}
      </section>
    </>
  );
}
