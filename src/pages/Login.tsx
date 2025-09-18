import { SyntheticEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ToastContainer } from "react-toastify";
import { TypeAnimation } from "react-type-animation";
import useToaster from "../hooks/useToaster";
import loadingIcon from "../imgs/loading.gif";
import httpCallers from "../service";
import { UserRoles } from "../types";

export default function Login(props: {
  role: UserRoles;
  shouldShowSignup?: boolean;
}) {
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
        const { data } = await httpCallers.post(
          `${props.role}-users/authenticate`,
          {
            email,
            password,
          }
        );

        localStorage.setItem("userId", data.id);

        navigate(`/${props.role}`);
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
    if (localStorage.getItem("userId")) {
      navigate(`/${props.role}`);
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
          {props.shouldShowSignup && (
            <div
              style={{
                marginTop: 16,
                fontSize: 12,
                width: "100%",
                textAlign: "center",
              }}
            >
              <hr style={{ width: "100%" }} />
              <span>No account?</span> <Link to="/signup">Click here!</Link>
            </div>
          )}
        </form>
      </main>
    </>
  );
}
