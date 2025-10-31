import React from 'react';
import { ArrowLeftIcon, BookOpenIcon } from './icons/Icons';

interface HeaderProps {
  showBackButton: boolean;
  onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ showBackButton, onBack }) => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* Left side */}
        <div className="w-10">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
              aria-label="Back to Surah list"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Center */}
        <div className="flex items-center gap-2">
          {!showBackButton && (
            <>
              <BookOpenIcon className="w-8 h-8 text-[#158c6e]" />
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center">
                Quran Explorer
              </h1>
            </>
          )}
        </div>

        {/* Right side (spacer) */}
        <div className="w-10"></div>
      </div>
    </header>
  );
};

export default Header;