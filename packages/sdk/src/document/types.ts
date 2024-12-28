export type Document = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Collaborator = {
  id: string;
  name: string;
  image: string | null;
  email: string;
};

export type Presence = {
  collaborators: Collaborator[];
};

export type Awareness = {
  user: Collaborator;
};
