import { Chapter, Verse, SurahDetailApiResponse } from '../types';

const API_BASE_URL = 'https://api.quran.com/api/v4';

// A simple in-memory cache
const cache = new Map<string, any>();

async function fetchWithCache<T,>(url: string): Promise<T> {
  if (cache.has(url)) {
    return Promise.resolve(cache.get(url) as T);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }
  const data = await response.json();
  cache.set(url, data);
  return data as T;
}


export const getAllChapters = async (): Promise<Chapter[]> => {
  const data = await fetchWithCache<{ chapters: Chapter[] }>(`${API_BASE_URL}/chapters?language=en`);
  return data.chapters;
};

export const getSurahDetail = async (surahId: number): Promise<Verse[]> => {
    // This unified endpoint fetches verses and audio (Reciter ID 7) in one call.
    // The API paginates results, so we add per_page=300 to get all verses (longest surah is 286).
    const url = `${API_BASE_URL}/verses/by_chapter/${surahId}?language=en&words=false&audio=7&fields=text_uthmani&per_page=300`;
    const data = await fetchWithCache<SurahDetailApiResponse>(url);
    return data.verses;
};