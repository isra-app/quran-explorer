export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  pages: [number, number];
  translated_name: {
    language_name: string;
    name: string;
  };
}

// Redefined to match the new unified API structure
export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  audio?: {
    url: string;
  };
}

// New type for the API response wrapper
export interface SurahDetailApiResponse {
    verses: Verse[];
}
