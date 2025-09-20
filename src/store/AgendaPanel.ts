import { MouseEvent } from "react";
import { create } from "zustand";

export interface AgendaPanelStateMutator {
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  handleOpen: (element: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
}

const useAgendaPanelStore = create<AgendaPanelStateMutator>((set) => ({
  isOpen: false,
  anchorElement: null,
  handleOpen: (element) =>
    set(() => ({ anchorElement: element.currentTarget, isOpen: true })),
  handleClose: () => set(() => ({ anchorElement: null, isOpen: false })),
}));

export { useAgendaPanelStore };
