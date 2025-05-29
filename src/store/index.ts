import { MouseEvent } from "react";
import { create } from "zustand";

interface ActionPanelState {
  isOpen: boolean;
  anchorElement: HTMLElement | null;
  handleClick: (element: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
}

const useActionPanelStore = create<ActionPanelState>((set) => ({
  isOpen: false,
  anchorElement: null,
  handleClick: (element) =>
    set(() => ({ anchorElement: element.currentTarget, isOpen: true })),
  handleClose: () => set(() => ({ anchorElement: null, isOpen: false })),
}));

export { useActionPanelStore };
