import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getSurahDetail } from '../services/quranApi';
import { PlayIcon, PauseIcon, CopyIcon, VerseEndIcon } from './icons/Icons';

interface SurahDetailProps {
  surah: {
    id: number;
    name: string;
    name_arabic: string;
    versesCount: number;
    verseKey?: string;
  };
  onGoToNextSurah: (currentSurahId: number) => void;
}

interface VerseWithDetails {
    id: number;
    verse_key: string;
    text_uthmani: string;
    audioUrl?: string;
}

const SkeletonPageView: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-pulse h-[calc(100vh-10rem)] flex flex-col">
        <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto mb-6"></div>
        <div className="space-y-10 flex-grow" dir="rtl">
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-5/6"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
            <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-8 bg-gray-200 rounded w-4/6"></div>
            </div>
        </div>
    </div>
);

const toEasternArabicNumerals = (num: string | number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num).split('').map(digit => {
        const parsedDigit = parseInt(digit, 10);
        return isNaN(parsedDigit) ? digit : arabicNumerals[parsedDigit];
    }).join('');
};

const SurahDetail: React.FC<SurahDetailProps> = ({ surah, onGoToNextSurah }) => {
  const { id: surahId, name: surahName, name_arabic: surahNameArabic, verseKey: verseKeyToScrollTo } = surah;

  const [versesWithDetails, setVersesWithDetails] = useState<VerseWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const individualVerseRefs = useRef<Map<string, HTMLElement>>(new Map());
  
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const fetchSurahData = async () => {
      try {
        setLoading(true);
        setError(null);
        setPlayingVerseKey(null);
        setSelectedVerseKey(null);

        const versesFromApi = await getSurahDetail(surahId);
        
        const processedVerses: VerseWithDetails[] = versesFromApi.map((verse) => {
            const audioUrl = verse.audio?.url;
            return {
                id: verse.id,
                verse_key: verse.verse_key,
                text_uthmani: verse.text_uthmani,
                audioUrl: audioUrl ? `https://verses.quran.com/${audioUrl}` : undefined,
            };
        });
        setVersesWithDetails(processedVerses);

      } catch (err) {
        setError('Failed to load Surah details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurahData();
  }, [surahId]);

  useEffect(() => {
    if (!loading && versesWithDetails.length > 0 && verseKeyToScrollTo) {
      const verseElement = individualVerseRefs.current.get(verseKeyToScrollTo);
      if (verseElement) {
        verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setSelectedVerseKey(verseKeyToScrollTo);
      }
    }
  }, [loading, versesWithDetails, verseKeyToScrollTo]);

  const handlePlay = useCallback((verseKey: string, autoPlayNext = false) => {
    const verseData = versesWithDetails.find(v => v.verse_key === verseKey);
    const audioUrl = verseData?.audioUrl;
    if (!audioUrl) return;

    localStorage.setItem('quranExplorer-lastRecited', JSON.stringify({ surahId, surahName, verseKey }));
    setSelectedVerseKey(verseKey);

    if (audioRef.current && playingVerseKey === verseKey) {
      audioRef.current.pause();
      setPlayingVerseKey(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
      setPlayingVerseKey(verseKey);
      
      audioRef.current.onended = () => {
          setPlayingVerseKey(null);
          const currentVerseIndex = versesWithDetails.findIndex(v => v.verse_key === verseKey);

          if (currentVerseIndex === versesWithDetails.length - 1) { 
              onGoToNextSurah(surahId);
          } else if(autoPlayNext) {
             const nextVerse = versesWithDetails[currentVerseIndex + 1];
             if(nextVerse) {
                handlePlay(nextVerse.verse_key, true);
                individualVerseRefs.current.get(nextVerse.verse_key)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
             }
          }
      };

      audioRef.current.onerror = () => {
        setError(`Could not play audio for ${verseKey}.`);
        setPlayingVerseKey(null);
      }
    }
  }, [versesWithDetails, playingVerseKey, surahId, surahName, onGoToNextSurah]);

  const handleSelectVerse = (verseKey: string) => {
    if (selectedVerseKey === verseKey) {
      setSelectedVerseKey(null);
    } else {
      setSelectedVerseKey(verseKey);
    }
  };
  
  const handleCopy = useCallback(() => {
    if (!selectedVerseKey) return;
    const verseToCopy = versesWithDetails.find(v => v.verse_key === selectedVerseKey);
    if (verseToCopy) {
      navigator.clipboard.writeText(verseToCopy.text_uthmani).then(() => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      });
    }
  }, [selectedVerseKey, versesWithDetails]);

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }
  
  const BISMILLAH = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
  const showBismillah = surahId !== 1 && surahId !== 9;

  return (
    <div className="space-y-4">
      {loading ? (
        <SkeletonPageView />
      ) : (
        <div className="bg-white p-4 sm:p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-10rem)]">
            <div className="text-center mb-6 pb-4 border-b-2 border-gray-200">
                <h2 dir="rtl" className="font-amiri text-4xl md:text-5xl text-gray-800">
                    {surahNameArabic}
                </h2>
                {showBismillah && (
                    <p dir="rtl" className="font-quran text-2xl text-gray-600 mt-4">
                        {BISMILLAH}
                    </p>
                )}
            </div>

            <div dir="rtl" className="no-scrollbar font-quran text-2xl md:text-3xl leading-relaxed text-center text-gray-800 flex-grow overflow-y-auto">
                {versesWithDetails.map(verse => {
                    const isSelected = selectedVerseKey === verse.verse_key;
                    const isPlaying = playingVerseKey === verse.verse_key;
                    const verseNumber = verse.verse_key.split(':')[1];
                    
                    return (
                        <React.Fragment key={verse.verse_key}>
                            <span 
                                id={`verse-${verse.verse_key}`}
                                ref={el => { if (el) individualVerseRefs.current.set(verse.verse_key, el); }}
                                onClick={() => handleSelectVerse(verse.verse_key)}
                                className={`cursor-pointer transition-colors duration-300 px-1 rounded-md ${ isPlaying ? 'bg-teal-200' : isSelected ? 'bg-teal-100' : 'hover:bg-gray-100' }`}
                            >
                                {verse.text_uthmani}
                            </span>
                            
                            <span className="relative inline-flex items-center justify-center w-9 h-9 mx-1 align-middle select-none">
                                <VerseEndIcon className="absolute w-full h-full text-teal-100" />
                                <span className="relative font-quran text-sm font-bold text-teal-800">
                                    {toEasternArabicNumerals(verseNumber)}
                                </span>
                            </span>
                        </React.Fragment>
                    );
                })}
            </div>

            {selectedVerseKey && (
              <div dir="ltr" className="text-left mt-4 pt-4 border-t border-gray-200 animate-fade-in text-base font-sans shrink-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <button onClick={() => handlePlay(selectedVerseKey, true)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#158c6e] transition-colors p-2 rounded-md hover:bg-gray-200">
                          {playingVerseKey === selectedVerseKey ? <PauseIcon className="w-5 h-5 text-[#158c6e]" /> : <PlayIcon className="w-5 h-5" />}
                          <span>{playingVerseKey === selectedVerseKey ? 'Pause' : 'Play Audio'}</span>
                      </button>
                      <button onClick={handleCopy} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#158c6e] transition-colors p-2 rounded-md hover:bg-gray-200">
                          <CopyIcon className="w-5 h-5" />
                          <span>{copyStatus === 'copied' ? 'Copied!' : 'Copy Verse'}</span>
                      </button>
                  </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SurahDetail;