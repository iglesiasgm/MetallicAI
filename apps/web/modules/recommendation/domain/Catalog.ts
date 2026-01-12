export type BandMember = {
  name: string;
  role: string;
  period: string;
};

export type BandLink = {
  spotify?: string;
  youtube?: string;
  instagram?: string;
};

export type Band = {
  id: string | number;
  name: string;
  subgenres: string[];
  moods: string[];
  features: string[];
  description: string;
  members: BandMember[];
  imageUrl?: string;
  popularity?: number;
  links?: BandLink[]; // ✅ ahora coincide con backend
};

export type CreateBandDraft = {
  name: string;
  subgenres: string[];
  moods: string[];
  features: string[];
  description: string;
  members: BandMember[];
  spotify: string;
};
