import { useCallback, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import useToaster from "./hooks/useToaster";
import httpCallers from "./service";
import { useOrganizationInfoStore, useUserInfoStore } from "./store";
import { Doctor, UserRoles } from "./types";

export default function RestrictWrapper(props: { role: UserRoles }) {
  const userId = localStorage.getItem("userId");

  const userInfoStore = useUserInfoStore();
  const organizationInfoStore = useOrganizationInfoStore();

  const { triggerToast } = useToaster({ type: "error" });

  const fetchUserInfo = useCallback(async () => {
    try {
      const { data: userData } = await httpCallers.get(
        `${props.role}-users/${userId}`
      );

      if (props.role === "doctor" || props.role === "support") {
        const { data: organizationData } = await httpCallers.get(
          `/organizations/${userData.organizationId}`
        );

        const organizationDoctors: Doctor[] = [];

        for (const collaborator of organizationData.collaborators) {
          if (collaborator.role === "doctor") {
            const { data: doctorData } = await httpCallers.get(
              `/doctor-users/${collaborator.id}`
            );

            const { data: linkedPatients } = await httpCallers.get(
              `/doctor-users/${collaborator.id}/linked-patients`
            );

            organizationDoctors.push({
              id: doctorData.id,
              fullname: doctorData.fullname,
              birthdate: doctorData.birthdate,
              email: doctorData.email,
              profilePicFileName: doctorData.profilePicFileName,
              phoneNumber: doctorData.phoneNumber,
              patients: linkedPatients.items,
            });
          }
        }

        organizationInfoStore.setData({
          id: organizationData.id,
          name: organizationData.name,
          address: organizationData.address,
          phoneNumber: organizationData.phoneNumber,
          collaborators: organizationData.collaborators,
          timezoneOffset: organizationData.timezoneOffset,
          doctors: organizationDoctors,
        });
      }

      userInfoStore.setData({
        id: userData.id,
        email: userData.email,
        fullname: userData.fullname,
        nickname: userData.nickname,
        profilePicFileName: userData.profilePicFileName,
        role: props.role,
      });
    } catch {
      triggerToast();
    }
  }, [triggerToast, props.role, userId]);

  useEffect(() => {
    fetchUserInfo();
  }, [fetchUserInfo]);

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
