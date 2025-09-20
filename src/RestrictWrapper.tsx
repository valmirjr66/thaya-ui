import { useCallback, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import useToaster from "./hooks/useToaster";
import httpCallers from "./service";
import { useOrganizationInfoStore, useUserInfoStore } from "./store";
import { Doctor, Organization, UserRoles } from "./types";

export default function RestrictWrapper(props: { role: UserRoles }) {
  const userId = localStorage.getItem("userId");

  const userInfoStore = useUserInfoStore();
  const organizationInfoStore = useOrganizationInfoStore();

  const { triggerToast } = useToaster({ type: "error" });

  const fetchLinkedDoctors = useCallback(
    async (
      patientId: string
    ): Promise<{ id: string; fullname: string; email: string }[]> => {
      try {
        const { data } = await httpCallers.get(
          `/patient-users/${patientId}/linked-doctors`
        );

        return data.items;
      } catch {
        triggerToast();
        return [];
      }
    },
    [triggerToast]
  );

  const fetchOrganizationInfoAndSetStore = useCallback(
    async (organizationId: string): Promise<Omit<Organization, "supports">> => {
      try {
        const { data: organizationData } = await httpCallers.get(
          `/organizations/${organizationId}`
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

        const response: Omit<Organization, "supports"> = {
          id: organizationData.id,
          name: organizationData.name,
          address: organizationData.address,
          phoneNumber: organizationData.phoneNumber,
          collaborators: organizationData.collaborators,
          timezoneOffset: organizationData.timezoneOffset,
          doctors: organizationDoctors,
        };

        organizationInfoStore.setData(response);

        return response;
      } catch {
        triggerToast();
      }
    },
    [triggerToast]
  );

  const fetchUserInfo = useCallback(async () => {
    try {
      const { data: userData } = await httpCallers.get(
        `${props.role}-users/${userId}`
      );

      const defaultUserData = {
        id: userData.id,
        email: userData.email,
        fullname: userData.fullname,
      };

      if (props.role === "doctor") {
        const { doctors } = await fetchOrganizationInfoAndSetStore(
          userData.organizationId
        );

        userInfoStore.setData({
          ...defaultUserData,
          role: "doctor",
          organizationId: userData.organizationId,
          profilePicFileName: userData.profilePicFileName,
          birthdate: userData.birthdate,
          phoneNumber: userData.phoneNumber,
          patients: doctors.filter((doctor) => doctor.id === userData.id)[0]
            ?.patients,
        });
      } else if (props.role === "support") {
        await fetchOrganizationInfoAndSetStore(userData.organizationId);

        userInfoStore.setData({
          ...defaultUserData,
          role: "support",
          organizationId: userData.organizationId,
          profilePicFileName: userData.profilePicFileName,
        });
      } else if (props.role === "patient") {
        const doctors = await fetchLinkedDoctors(userData.id);

        userInfoStore.setData({
          ...defaultUserData,
          role: "patient",
          nickname: userData.nickname,
          profilePicFileName: userData.profilePicFileName,
          birthdate: userData.birthdate,
          phoneNumber: userData.phoneNumber,
          doctorsId: userData.doctorsId,
          doctors,
        });
      } else {
        userInfoStore.setData({
          role: "admin",
          ...defaultUserData,
        });
      }
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
