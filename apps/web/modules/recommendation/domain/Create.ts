export interface Member {
  name: string;
  role: string;
  period?: string;
}

export interface BandLinks {
  spotify?: string;
  youtube?: string;
  instagram?: string;
}

export interface CreateBandInput {
  name: string;
  subgenres: string[];
  moods: string[];
  features: string[];
  members: Member[];
  description: string;
  links: BandLinks[];
}
