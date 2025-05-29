import { Navigate, Outlet } from "react-router";

export default function RestrictWrapper() {
  const userEmail = localStorage.getItem("userEmail");

  return userEmail ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ path: location.pathname }} />
  );
}
