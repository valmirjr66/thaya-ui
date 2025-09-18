export type Reference = {
  _id: string;
  fileId: string;
  downloadURL: string;
  displayName: string;
  previewImageURL?: string;
};

export type Message = {
  _id: string;
  content: string;
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
};

export type Doctor = {
  id: string;
  fullname: string;
  email: string;
  phoneNumber: string;
  birthdate: string;
  profilePicFileName?: string;
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
  doctors?: Doctor[];
  supports?: Support[];
};

export type CalendarOccurrence = {
  id: string;
  datetime: string;
  description: string;
};

export type UserRoles = "admin" | "doctor" | "support" | "patient";
