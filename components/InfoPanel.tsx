import React, { useState, useEffect } from 'react';
import { PlanetData } from '../types';
import { generatePlanetFact } from '../services/geminiService';
import { X, Sparkles, Loader2 } from 'lucide-react';

interface InfoPanelProps {
  planet: PlanetData | null; // null means Sun or nothing
  onClose: () => void;
  isSun: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ planet, onClose, isSun }) => {
  const [aiFact, setAiFact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset state when planet changes
  useEffect(() => {
    setAiFact(null);
    setLoading(false);
  }, [planet, isSun]);

  if (!planet && !isSun) return null;

  const name = isSun ? "太阳" : planet?.name;
  const description = isSun 
    ? "太阳系的中心，一颗巨大的恒星。它为我们提供光和热，没有它就没有地球上的生命。" 
    : planet?.description;
  const color = isSun ? '#FFD700' : planet?.color;

  const handleAskAI = async () => {
    if (!name) return;
    setLoading(true);
    const fact = await generatePlanetFact(name);
    setAiFact(fact);
    setLoading(false);
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-6 text-white shadow-2xl transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="w-4 h-4 rounded-full inline-block border border-white/20" style={{ backgroundColor: color }}></span>
          {name}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed mb-4">
        {description}
      </p>

      {!isSun && planet && (
        <div className="grid grid-cols-2 gap-4 mb-6 text-xs text-gray-400">
          <div className="bg-white/5 p-2 rounded">
            <span className="block text-[10px] mb-1 opacity-70">轨道距离 (相对)</span>
            <span className="text-white font-mono font-bold text-sm">{planet.distance} AU</span>
          </div>
          <div className="bg-white/5 p-2 rounded">
             <span className="block text-[10px] mb-1 opacity-70">公转速度</span>
             <span className="text-white font-mono font-bold text-sm">{planet.speed}x</span>
          </div>
        </div>
      )}

      {/* AI Section */}
      <div className="border-t border-white/10 pt-4 mt-2">
        {!aiFact ? (
          <button 
            onClick={handleAskAI}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2 rounded-lg font-medium transition-all text-sm shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} />}
            {loading ? "正在连接宇宙..." : "AI 科普冷知识"}
          </button>
        ) : (
          <div className="bg-indigo-900/30 border border-indigo-500/30 p-3 rounded-lg animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-indigo-300 mb-2 text-xs uppercase font-bold tracking-wider border-b border-indigo-500/20 pb-1">
               <Sparkles size={12} /> 星际百科
            </div>
            <p className="text-sm text-indigo-100 italic leading-relaxed">
              "{aiFact}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;