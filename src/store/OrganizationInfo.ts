import { create } from "zustand";
import { Organization } from "../types";

export interface OrganizationInfoMutator {
  data: Omit<Organization, "supports">;
  setData: (newData: Omit<Organization, "supports">) => void;
}

const useOrganizationInfoStore = create<OrganizationInfoMutator>((set) => ({
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

export { useOrganizationInfoStore };
