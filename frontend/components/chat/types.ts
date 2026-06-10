export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  sources?: string[];
}

export interface Attachment {
  id: string;
  file: File;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: Date;
}