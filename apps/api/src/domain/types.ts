export interface Band {
  id: string;
  name: string;
  subgenres: string[];
  moods: string[]; 
  features: string[];
  description: string; 
  embedding?: number[]; 
}

export interface UserInput {
  favoriteBands: string[];
  targetMood: string;
}

export interface RecommendationResult {
  band: Band;
  score: number;
  explanation?: string;
}