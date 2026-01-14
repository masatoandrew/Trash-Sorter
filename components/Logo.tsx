
import React from 'react';

export const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mb-8 pt-8">
      {/* Diamond Logo representation */}
      <div className="relative w-16 h-16 flex items-center justify-center">
        <div className="absolute w-12 h-12 bg-darkGreen transform rotate-45 rounded-md"></div>
        <div className="absolute w-6 h-6 border-2 border-mint transform rotate-45"></div>
        <div className="absolute w-2 h-2 bg-mint transform rotate-45"></div>
        
        {/* Decorative dots from wireframe */}
        <div className="absolute -top-4 -left-12 text-darkGreen text-xl tracking-widest">...</div>
        <div className="absolute -top-4 -right-12 text-darkGreen text-xl tracking-widest">...</div>
      </div>
      <h1 className="mt-4 text-2xl font-bold text-darkGreen tracking-wide">Sort-It</h1>
    </div>
  );
};
