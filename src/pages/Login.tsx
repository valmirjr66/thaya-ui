import { SyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import { TypeAnimation } from "react-type-animation";
import useToaster from "../hooks/useToaster";
import httpCallers from "../service";
import loadingIcon from "../imgs/loading.gif";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authenticating, setAuthenticating] = useState(false);

  const navigate = useNavigate();

  const { triggerToast } = useToaster({ type: "error" });

  const submitCallback = (event: SyntheticEvent<any>) => {
    event.preventDefault();
    setAuthenticating(true);

    async function validateCredentials() {
      try {
        await httpCallers.post("user/authenticate", {
          email,
          password,
        });

        localStorage.setItem("userEmail", email);

        document.location.reload();
      } catch (err) {
        setEmail("");
        setPassword("");

        triggerToast(
          err.response?.data?.message ||
            "An error occurred while logging in. Please try again."
        );
      } finally {
        setAuthenticating(false);
      }
    }

    validateCredentials();
  };

  useEffect(() => {
    if (localStorage.getItem("userEmail")) {
      navigate("/");
    }
  }, []);

  return (
    <>
      <ToastContainer />
      <main className="loginWrapper">
        <p>
          <TypeAnimation
            sequence={[
              "I'm here to help you answer your questions",
              5000,
              "I'm here to help you automate your tasks",
              5000,
              "I'm here to help you manage your time",
              5000,
            ]}
            speed={70}
            wrapper="span"
            repeat={Infinity}
          />
        </p>
        <form className="loginContainer" onSubmit={submitCallback}>
          <div className="fieldWrapper">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authenticating}
            />
          </div>
          <div className="fieldWrapper">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={authenticating}
            />
          </div>
          {authenticating ? (
            <img src={loadingIcon} width={30} />
          ) : (
            <button
              type="submit"
              className="primary"
              style={{ width: 150 }}
              disabled={!email || !password}
            >
              Login
            </button>
          )}
        </form>
      </main>
    </>
  );
}
