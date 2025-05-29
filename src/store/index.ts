import { MouseEvent } from "react";
import { create } from "zustand";

interface ActionPanelState {
  actionAnchorElement: HTMLElement | null;
  handleClick: (element: MouseEvent<HTMLElement>) => void;
  handleClose: () => void;
}

const useActionPanelStore = create<ActionPanelState>((set) => ({
  actionAnchorElement: null,
  handleClick: (element) =>
    set(() => ({ actionAnchorElement: element.currentTarget })),
  handleClose: () => set(() => ({ actionAnchorElement: null })),
}));

export { useActionPanelStore };
