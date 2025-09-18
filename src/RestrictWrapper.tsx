import { Navigate, Outlet } from "react-router";
import { UserRoles } from "./types";

export default function RestrictWrapper(props: { role: UserRoles }) {
  const userId = localStorage.getItem("userId");

  return userId ? (
    <Outlet />
  ) : (
    <Navigate
      to={`/${props.role}-login`}
      replace
      state={{ path: location.pathname }}
    />
  );
}
