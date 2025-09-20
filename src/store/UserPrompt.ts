import { create } from "zustand";

export interface UserPromptMutator {
  content: string;
  setContent: (newContent: string) => void;
}

const useUserPromptStore = create<UserPromptMutator>((set) => ({
  content: "",
  setContent: (newContent) => set(() => ({ content: newContent })),
}));

export { useUserPromptStore };
