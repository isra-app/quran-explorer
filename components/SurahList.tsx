import React, { useState, useEffect, useMemo } from 'react';
import { Chapter } from '../types';
import { SearchIcon, HistoryIcon } from './icons/Icons';

interface SurahListProps {
  chapters: Chapter[];
  loading: boolean;
  error: string | null;
  onSelectSurah: (id: number, name: string, name_arabic: string, versesCount: number, verseKey?: string) => void;
}

interface LastRecited {
    surahId: number;
    surahName: string;
    verseKey: string;
}

const LastRecitedCard: React.FC<{ lastRecited: LastRecited; onSelect: () => void }> = ({ lastRecited, onSelect }) => {
    const verseNumber = lastRecited.verseKey.split(':')[1];
    return (
        <div 
            onClick={onSelect} 
            className="bg-white p-4 mb-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-dashed border-teal-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            aria-label={`Continue reading ${lastRecited.surahName}, Verse ${verseNumber}`}
        >
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 text-[#158c6e] rounded-full flex items-center justify-center">
                    <HistoryIcon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Last Recited</p>
                    <p className="font-bold text-lg text-gray-800">{lastRecited.surahName}</p>
                    <p className="text-sm text-gray-600">Verse {verseNumber}</p>
                </div>
            </div>
            <div className="text-left sm:text-right mt-2 sm:mt-0">
                <span className="text-sm font-semibold text-[#158c6e] hover:underline">Continue Reading</span>
            </div>
        </div>
    );
};

const SurahCard: React.FC<{ chapter: Chapter; onSelect: () => void }> = ({ chapter, onSelect }) => (
  <div
    onClick={onSelect}
    className="bg-white p-4 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-200 flex items-center justify-between"
  >
    <div className="flex items-center gap-4">
      <div className="flex-shrink-0 w-10 h-10 bg-teal-100 text-[#158c6e] rounded-full flex items-center justify-center font-bold">
        {chapter.id}
      </div>
      <div>
        <p className="font-bold text-lg text-gray-800">{chapter.name_simple}</p>
        <p className="text-sm text-gray-500">{chapter.translated_name.name}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-quran text-2xl text-[#158c6e]">{chapter.name_arabic}</p>
      <p className="text-xs text-gray-400">{chapter.verses_count} Verses</p>
    </div>
  </div>
);

const SkeletonCard: React.FC = () => (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex items-center justify-between animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div>
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
            </div>
        </div>
        <div className="text-right">
            <div className="h-7 w-20 bg-gray-200 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 rounded mt-2"></div>
        </div>
    </div>
);


const SurahList: React.FC<SurahListProps> = ({ chapters, loading, error, onSelectSurah }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRecited, setLastRecited] = useState<LastRecited | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('quranExplorer-lastRecited');
    if (stored) {
      setLastRecited(JSON.parse(stored));
    }
  }, []);

  const filteredChapters = useMemo(() => {
    if (!searchTerm) return chapters;
    return chapters.filter(
      (chapter) =>
        chapter.name_simple.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.translated_name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chapter.id.toString() === searchTerm
    );
  }, [chapters, searchTerm]);

  const handleSelectLastRecited = () => {
    if (!lastRecited) return;
    const chapter = chapters.find(c => c.id === lastRecited.surahId);
    if (chapter) {
        onSelectSurah(lastRecited.surahId, lastRecited.surahName, chapter.name_arabic, chapter.verses_count, lastRecited.verseKey);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative" dir="ltr">
        <input
          type="text"
          placeholder="Search for a Surah by name or number"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-[#158c6e] focus:outline-none transition-shadow text-left"
        />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon className="w-6 h-6" />
        </div>
      </div>
      
      {lastRecited && (
          <LastRecitedCard 
            lastRecited={lastRecited}
            onSelect={handleSelectLastRecited}
          />
      )}

      {error && <p className="text-center text-red-500">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
           Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)
        ) : filteredChapters.length > 0 ? (
          filteredChapters.map((chapter) => (
            <SurahCard 
                key={chapter.id} 
                chapter={chapter} 
                onSelect={() => onSelectSurah(chapter.id, chapter.name_simple, chapter.name_arabic, chapter.verses_count)} 
            />
          ))
        ) : (
            <p className="text-center text-gray-500 md:col-span-2 lg:col-span-3">No Surahs found.</p>
        )}
      </div>
    </div>
  );
};

export default SurahList;