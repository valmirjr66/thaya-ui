import { PRESCRIPTION_STATUS, SERIES_TYPES, USER_ROLES } from "../constants";

export type Reference = {
  _id: string;
  fileId: string;
  downloadURL: string;
  displayName: string;
  previewImageURL?: string;
};

export type Message = {
  id: string;
  content: string;
  createdAt: Date;
  role: "assistant" | "user";
  references?: Reference[];
};

export type User = {
  id: string;
  fullname: string;
  nickname?: string;
  profilePicFileName?: string;
  email: string;
  birthdate: Date;
  phoneNumber: string;
  doctorsId?: string[];
};

export type Doctor = {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  birthdate: string;
  profilePicFileName?: string;
  patients?: { id: string; fullname: string; nickname?: string }[];
};

export type Support = {
  id: string;
  fullname: string;
  email: string;
};

export type Organization = {
  id: string;
  name: string;
  collaborators: { id: string; role: "doctor" | "support" }[];
  phoneNumber: string;
  address: string;
  timezoneOffset: number;
  profilePicFileName?: string;
  doctors?: Doctor[];
  supports?: Support[];
};

export type CalendarOccurrence = {
  id: string;
  userId: string;
  datetime: string;
  description: string;
  patientId: string;
  patientName: string;
};

export type UserRoles = (typeof USER_ROLES)[number];

export type SeriesType = (typeof SERIES_TYPES)[number];

export type PatientRecord = {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  patientName?: string;
  summary?: string;
  content?: string;
  series: {
    id: string;
    title: string;
    type: SeriesType;
    records: { datetime: Date; value: number }[];
  }[];
  prescriptions?: Prescription[];
};

export type PrescriptionStatus = (typeof PRESCRIPTION_STATUS)[number];

export type Prescription = {
  id: string;
  doctorId: string;
  patientId: string;
  summary: string;
  fileName: string;
  status: PrescriptionStatus;
  createdAt: Date;
  updatedAt: Date;
};
