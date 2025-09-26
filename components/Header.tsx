
import React from 'react';
import { BrainIcon } from './icons/BrainIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
            <BrainIcon className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            J-SOX RCM Information Extraction AI Agent
            </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
