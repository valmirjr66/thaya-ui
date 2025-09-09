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
  fullname: string;
  nickname?: string;
  profilePicFileName?: string;
  email: string;
  birthdate: Date;
};

export type CalendarOccurrence = {
  id: string;
  datetime: string;
  description: string;
};
