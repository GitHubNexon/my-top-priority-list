//For CRUD Operations
export interface Notes {
  id: string;
  NotesCategory: string;
  Title: string;
  TypeOfNotesCategory?: {
    type?: string;
    icon?: string;
  };
  Occurrence?: string;
  Amount?: string;
  TypeOfNote: {
    type: string;
    icon: string;
  };
  Description?: string;
  Time?: string;
  Date?: string;
  Days?: string[];
}

//For UI changes
export type NoteType = {
  value: string;
  label: string;
  icon: string;
};

export interface SyncFailedNotesId {
  uploadedNotesId: string[];
  updatedNotesId: string[];
  deletedNotesId: string[];
};

export const successfulSync: string[] = [];