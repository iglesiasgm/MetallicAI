export interface Band {
  id: string;
  name: string;
  subgenres: string[];
  moods: string[]; 
  features: string[];
  description: string; 
  members: Member[];
  embedding?: number[]; 
}
export interface Member {
  name: string;
  role: string; 
  period?: string; 
}

export interface UserInput {
  favoriteBands: string[];
  targetMood: string;
  language: LanguageCode;
}

export interface RecommendationResult {
  band: Band;
  score: number;
  explanation?: string;
}

export type LanguageCode = 'es' | 'en' | 'it' | 'de' | 'pt';

export const SUPPORTED_LANGUAGES: Record<LanguageCode, string> = {
  es: 'Español (Metalero Latino)',
  en: 'English (Metalhead slang)',
  it: 'Italiano',
  de: 'Deutsch',
  pt: 'Português'
};