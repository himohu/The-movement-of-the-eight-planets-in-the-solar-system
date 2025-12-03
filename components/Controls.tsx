import React from 'react';
import { Plus, Minus, Play, Pause, Eye, EyeOff } from 'lucide-react';

interface ControlsProps {
  zoom: number;
  setZoom: (z: number) => void;
  speed: number;
  setSpeed: (s: number) => void;
  paused: boolean;
  setPaused: (p: boolean) => void;
  showOrbits: boolean;
  setShowOrbits: (s: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
  zoom, setZoom, speed, setSpeed, paused, setPaused, showOrbits, setShowOrbits
}) => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full flex items-center gap-6 text-white shadow-xl z-10">
      
      {/* Zoom */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setZoom(Math.max(0.2, zoom - 0.2))} 
          className="p-1 hover:bg-white/10 rounded-full"
        >
          <Minus size={16} />
        </button>
        <span className="text-xs font-mono w-12 text-center">{zoom.toFixed(1)}x</span>
        <button 
          onClick={() => setZoom(Math.min(5, zoom + 0.2))} 
          className="p-1 hover:bg-white/10 rounded-full"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="w-px h-6 bg-white/20"></div>

      {/* Speed */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setPaused(!paused)} 
          className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-200 transition"
        >
          {paused ? <Play size={14} fill="black" /> : <Pause size={14} fill="black" />}
        </button>
        
        <input 
          type="range" 
          min="0" 
          max="10" 
          step="0.5"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <span className="text-xs font-mono w-8">{speed}x</span>
      </div>

       <div className="w-px h-6 bg-white/20"></div>

       {/* Toggles */}
       <button 
        onClick={() => setShowOrbits(!showOrbits)}
        className={`p-2 rounded-full transition ${showOrbits ? 'text-blue-400 bg-blue-400/10' : 'text-gray-400 hover:text-white'}`}
        title="Toggle Orbits"
       >
         {showOrbits ? <Eye size={18} /> : <EyeOff size={18} />}
       </button>

    </div>
  );
};

export default Controls;
