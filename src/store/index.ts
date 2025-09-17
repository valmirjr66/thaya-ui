import { MouseEvent } from "react";
import { create } from "zustand";
import { User } from "../types";

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
  data: Omit<User, "birthdate" | "phoneNumber">;
  setData: (newData: Omit<User, "birthdate" | "phoneNumber">) => void;
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
    profilePicFileName: "",
  },
  setData: (newData) => set(() => ({ data: newData })),
}));

export { useAgendaPanelStore, useUserInfoStore, useUserPromptStore };
