export type BandMember = {
  name: string;
  role: string;
  period: string;
};

export type Band = {
  id: string | number;
  name: string;
  subgenres: string[];
  moods: string[];
  features: string[];
  description: string;
  members: BandMember[];
};
