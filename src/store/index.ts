import { MouseEvent } from "react";
import { create } from "zustand";

interface ActionPanelState {
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  handleOpen: (element: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
}

interface AgendaPanelState {
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  handleOpen: (element: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
}

const useActionPanelStore = create<ActionPanelState>((set) => ({
  isOpen: false,
  anchorElement: null,
  handleOpen: (element) =>
    set(() => ({ anchorElement: element.currentTarget, isOpen: true })),
  handleClose: () => set(() => ({ anchorElement: null, isOpen: false })),
}));

const useAgendaPanelStore = create<AgendaPanelState>((set) => ({
  isOpen: false,
  anchorElement: null,
  handleOpen: (element) =>
    set(() => ({ anchorElement: element.currentTarget, isOpen: true })),
  handleClose: () => set(() => ({ anchorElement: null, isOpen: false })),
}));

export { useActionPanelStore, useAgendaPanelStore };
