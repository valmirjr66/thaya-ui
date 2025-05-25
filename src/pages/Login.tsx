import { SyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import { TypeAnimation } from "react-type-animation";

export default function Login() {
  const CREDENTIAL_PAIRS: Record<string, string> = {
    valmir: "123",
    external: "123",
  };

  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  let navigate = useNavigate();

  const submitCallback = (event: SyntheticEvent<any>) => {
    event.preventDefault();

    if (CREDENTIAL_PAIRS[user] === password) {
      localStorage.setItem("userId", user);
      document.location.reload();
    } else {
      setUser("");
      setPassword("");

      toast("Invalid credentials, please try again 😟", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        type: "error",
      });
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userId")) {
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
            <label htmlFor="userId">User</label>
            <input
              id="userId"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="fieldWrapper">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="primary"
            style={{ width: 150 }}
            disabled={!user || !password}
          >
            Login
          </button>
        </form>
      </main>
    </>
  );
}
