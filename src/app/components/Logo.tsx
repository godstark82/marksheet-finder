import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center">
      <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mr-2">
        <div className="text-indigo-800 font-bold text-xl">NU</div>
      </div>
      <div className="flex flex-col">
        <div className="font-bold text-lg md:text-xl">NIMS University</div>
        <div className="text-xs text-indigo-200">NIET College</div>
      </div>
    </div>
  );
} 