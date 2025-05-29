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
