import React from 'react';
import { Page } from '../types';

interface NavProps {
  setPage: (page: Page) => void;
  currentPage: Page;
}

export const Nav: React.FC<NavProps> = ({ setPage, currentPage }) => {
  const canGoBack = currentPage !== Page.LOGIN && currentPage !== Page.HOME;

  return (
    <div className="w-full flex justify-between items-center p-4 absolute top-0 left-0 z-50 text-darkGreen">
      {canGoBack && (
        <button 
          onClick={() => setPage(Page.HOME)}
          className="p-2 rounded-full hover:bg-white/50 bg-white/20 backdrop-blur-sm shadow-sm"
          aria-label="Go home"
        >
          <i className="fa-solid fa-arrow-left text-xl"></i>
        </button>
      )}
      
      {!canGoBack && <div />} {/* Spacer */}

      <div className="flex gap-4">
         {currentPage !== Page.LOGIN && currentPage !== Page.SIGNUP && (
             <>
                <button 
                    onClick={() => setPage(Page.DASHBOARD)}
                    className={`p-2 rounded-full hover:bg-white/50 bg-white/20 backdrop-blur-sm shadow-sm ${currentPage === Page.DASHBOARD ? 'text-teal ring-2 ring-teal' : ''}`}
                    aria-label="Dashboard"
                >
                    <i className="fa-solid fa-chart-line text-xl"></i>
                </button>
                <button 
                    onClick={() => setPage(Page.ABOUT)}
                    className="p-2 rounded-full hover:bg-white/50 bg-white/20 backdrop-blur-sm shadow-sm"
                    aria-label="About"
                >
                    <i className="fa-solid fa-circle-info text-xl"></i>
                </button>
                <button 
                    onClick={() => setPage(Page.SETTINGS)}
                    className="p-2 rounded-full hover:bg-white/50 bg-white/20 backdrop-blur-sm shadow-sm"
                    aria-label="Settings"
                >
                    <i className="fa-solid fa-gear text-xl"></i>
                </button>
             </>
         )}
      </div>
    </div>
  );
};