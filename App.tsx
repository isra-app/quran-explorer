import React, { useState, useEffect } from 'react';
import SurahList from './components/SurahList';
import SurahDetail from './components/SurahDetail';
import Header from './components/Header';
import { Chapter } from './types';
import { getAllChapters } from './services/quranApi';

interface SelectedSurah {
  id: number;
  name: string;
  name_arabic: string;
  versesCount: number;
  verseKey?: string;
}

const App: React.FC = () => {
  const [selectedSurah, setSelectedSurah] = useState<SelectedSurah | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [errorChapters, setErrorChapters] = useState<string | null>(null);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoadingChapters(true);
        const data = await getAllChapters();
        setChapters(data);
      } catch (err) {
        setErrorChapters('Failed to load Surahs. Please try again later.');
      } finally {
        setLoadingChapters(false);
      }
    };
    fetchChapters();
  }, []);

  const handleSelectSurah = (id: number, name: string, name_arabic: string, versesCount: number, verseKey?: string) => {
    setSelectedSurah({ id, name, name_arabic, versesCount, verseKey });
  };
  
  const handleGoToNextSurah = (currentSurahId: number) => {
    if (currentSurahId >= 114) {
        // This is the last surah, do nothing
        return;
    }
    const nextSurah = chapters.find(c => c.id === currentSurahId + 1);
    if (nextSurah) {
        handleSelectSurah(nextSurah.id, nextSurah.name_simple, nextSurah.name_arabic, nextSurah.verses_count);
    }
  };

  const handleBackToList = () => {
    setSelectedSurah(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 transition-colors duration-300">
      <Header 
        showBackButton={!!selectedSurah} 
        onBack={handleBackToList}
      />
      <main className="container mx-auto p-4 md:p-6">
        {selectedSurah ? (
          <SurahDetail 
            key={selectedSurah.id}
            surah={selectedSurah} 
            onGoToNextSurah={handleGoToNextSurah}
          />
        ) : (
          <SurahList 
            chapters={chapters}
            loading={loadingChapters}
            error={errorChapters}
            onSelectSurah={(id, name, name_arabic, versesCount, verseKey) => handleSelectSurah(id, name, name_arabic, versesCount, verseKey)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;