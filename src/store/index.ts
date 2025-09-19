import { MouseEvent } from "react";
import { create } from "zustand";
import { Organization, User, UserRoles } from "../types";

interface AgendaPanelState {
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  handleOpen: (element: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
}

interface UserPrompt {
  content: string;
  setContent: (newContent: string) => void;
}

interface UserInfo {
  data: Omit<User, "birthdate" | "phoneNumber"> & { role: UserRoles };
  setData: (
    newData: Omit<User, "birthdate" | "phoneNumber"> & { role: UserRoles }
  ) => void;
}

interface OrganizationInfo {
  data: Omit<Organization, "supports">;
  setData: (newData: Omit<Organization, "supports">) => void;
}

const useUserPromptStore = create<UserPrompt>((set) => ({
  content: "",
  setContent: (newContent) => set(() => ({ content: newContent })),
}));

const useAgendaPanelStore = create<AgendaPanelState>((set) => ({
  isOpen: false,
  anchorElement: null,
  handleOpen: (element) =>
    set(() => ({ anchorElement: element.currentTarget, isOpen: true })),
  handleClose: () => set(() => ({ anchorElement: null, isOpen: false })),
}));

const useUserInfoStore = create<UserInfo>((set) => ({
  data: {
    id: "",
    email: "",
    fullname: "",
    role: "doctor",
  },
  setData: (newData) => set(() => ({ data: newData })),
}));

const useOrganizationInfoStore = create<OrganizationInfo>((set) => ({
  data: {
    id: "",
    address: "",
    name: "",
    phoneNumber: "",
    collaborators: [],
    timezoneOffset: 0,
  },
  setData: (newData) => set(() => ({ data: newData })),
}));

export {
  useAgendaPanelStore, useOrganizationInfoStore, useUserInfoStore,
  useUserPromptStore
};

