import { create } from "zustand";
import { UserRoles } from "../types";

export type GenericUser = {
  id: string;
  email: string;
  fullname: string;
  role: UserRoles;
};

export interface AdminUserInfo extends GenericUser {
  role: "admin";
}

export interface DoctorUserInfo extends GenericUser {
  role: "doctor";
  birthdate: string;
  phoneNumber: string;
  organizationId: string;
  profilePicFileName?: string;
  patients?: { id: string; fullname: string; nickname?: string }[];
}

export interface SupportUserInfo extends GenericUser {
  role: "support";
  organizationId: string;
  profilePicFileName?: string;
}

export interface PatientUserInfo extends GenericUser {
  role: "patient";
  birthdate: string;
  phoneNumber: string;
  nickname?: string;
  profilePicFileName?: string;
  doctorsId?: string[];
  doctors?: { id: string; fullname: string; email: string }[];
}

type UserInfo =
  | AdminUserInfo
  | DoctorUserInfo
  | SupportUserInfo
  | PatientUserInfo;

export interface UserInfoMutator {
  data: UserInfo | null;
  setData: (newData: UserInfo | null) => void;
}

const useUserInfoStore = create<UserInfoMutator>((set) => ({
  data: null,
  setData: (newData) => set(() => ({ data: newData })),
}));

export { useUserInfoStore };
