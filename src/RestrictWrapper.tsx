import { Navigate, Outlet } from "react-router";

export default function RestrictWrapper() {
  const userId = localStorage.getItem("userId");

  return userId ? (
    <Outlet />
  ) : (
    <Navigate to="/login" replace state={{ path: location.pathname }} />
  );
}
