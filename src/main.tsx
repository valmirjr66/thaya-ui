import { ThemeProvider } from "@emotion/react";
import { createTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ptBR } from "@mui/x-date-pickers/locales";
import "dayjs/locale/pt-br";
import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import Font from "react-font";
import { SkeletonTheme } from "react-loading-skeleton";
import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import "./index.css";
import Chat from "./pages/Chat";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import reportWebVitals from "./reportWebVitals";
import RestrictWrapper from "./RestrictWrapper";

const theme = createTheme(
  {
    palette: {
      mode: "dark",
    },
  },
  ptBR
);

function fallbackRender({ error, resetErrorBoundary }: FallbackProps) {
  // TODO: Implement a pretty fallback page
  return (
    <div
      role="alert"
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      <p style={{ textAlign: "center" }}>Something went wrong:</p>
      <pre style={{ textAlign: "center", color: "red" }}>{error.message}</pre>
      <p style={{ display: "flex", justifyContent: "center" }}>
        <button onClick={resetErrorBoundary} style={{ padding: 6 }}>
          Try again
        </button>
      </p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onReset={(details) => {
        // TODO: Implement something
        // Reset the state of your app so the error doesn't happen again
      }}
    >
      <ThemeProvider theme={theme}>
        <SkeletonTheme baseColor="#7a7a7a" highlightColor="#d2d2d2">
          <Font family="Overpass Mono">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <BrowserRouter>
                <Routes>
                  <Route element={<RestrictWrapper />}>
                    <Route path="/" element={<Chat />} />
                    <Route path="/settings" element={<Settings />} />
                  </Route>
                  <Route path="/login" element={<Login />} />
                </Routes>
              </BrowserRouter>
            </LocalizationProvider>
          </Font>
        </SkeletonTheme>
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
