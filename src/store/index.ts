import { MouseEvent } from "react";
import { create } from "zustand";

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

export { useAgendaPanelStore, useUserPromptStore };
