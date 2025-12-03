import React, { useState, useCallback, useEffect } from 'react';
import SolarSystemCanvas from './components/SolarSystemCanvas';
import Controls from './components/Controls';
import InfoPanel from './components/InfoPanel';
import { Vector2 } from './types';
import { PLANETS } from './constants';

const App: React.FC = () => {
  // State
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<Vector2>({ x: 0, y: 0 });
  const [speed, setSpeed] = useState<number>(1);
  const [paused, setPaused] = useState<boolean>(false);
  const [showOrbits, setShowOrbits] = useState<boolean>(true);
  const [focusedBodyId, setFocusedBodyId] = useState<string | null>(null);

  // Derived State
  const selectedPlanet = focusedBodyId && focusedBodyId !== 'sun' 
    ? PLANETS.find(p => p.id === focusedBodyId) || null 
    : null;
  const isSunSelected = focusedBodyId === 'sun';

  // Handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    // Prevent default scrolling of the page
    e.preventDefault();
    setZoom(prev => {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      return Math.min(5, Math.max(0.1, prev * delta));
    });
  }, []);

  // Attach non-passive wheel listener for zoom to prevent browser scroll
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (root) {
        root.removeEventListener('wheel', handleWheel);
      }
    };
  }, [handleWheel]);

  const handlePlanetSelect = (id: string) => {
    setFocusedBodyId(id);
  };

  const closeInfo = () => {
    setFocusedBodyId(null);
  };

  return (
    <div className="w-screen h-screen relative bg-black overflow-hidden select-none font-sans">
      
      {/* Simulation Layer */}
      <SolarSystemCanvas 
        zoom={zoom}
        offset={offset}
        speedMultiplier={speed}
        isPaused={paused}
        showOrbits={showOrbits}
        focusedBodyId={focusedBodyId}
        onPlanetSelect={handlePlanetSelect}
        setOffset={setOffset}
      />

      {/* UI Overlay */}
      <div className="absolute top-6 left-6 pointer-events-none">
         <h1 className="text-white text-3xl font-bold tracking-tighter opacity-90 drop-shadow-md">太阳系 <span className="text-blue-500">探索者</span></h1>
         <p className="text-gray-400 text-xs mt-1">Interactive Solar System</p>
      </div>

      {/* Side Menu / Planet List */}
      <div className="absolute top-1/2 -translate-y-1/2 left-6 flex flex-col gap-3">
        <button 
           onClick={() => handlePlanetSelect('sun')}
           className={`w-4 h-4 rounded-full hover:scale-125 transition-all duration-300 border-2 border-transparent ${focusedBodyId === 'sun' ? 'bg-yellow-400 scale-125 shadow-[0_0_15px_#FFD700] border-white' : 'bg-yellow-600'}`}
           title="太阳 (Sun)"
        />
        {PLANETS.map(p => (
           <button 
             key={p.id}
             onClick={() => handlePlanetSelect(p.id)}
             className={`w-4 h-4 rounded-full hover:scale-125 transition-all duration-300 border-2 border-transparent`}
             style={{ 
               backgroundColor: p.color,
               opacity: focusedBodyId === p.id ? 1 : 0.7,
               boxShadow: focusedBodyId === p.id ? `0 0 15px ${p.color}` : 'none',
               borderColor: focusedBodyId === p.id ? 'white' : 'transparent',
               transform: focusedBodyId === p.id ? 'scale(1.3)' : 'scale(1)'
             }}
             title={p.name}
           />
        ))}
      </div>

      <Controls 
        zoom={zoom}
        setZoom={setZoom}
        speed={speed}
        setSpeed={setSpeed}
        paused={paused}
        setPaused={setPaused}
        showOrbits={showOrbits}
        setShowOrbits={setShowOrbits}
      />

      <InfoPanel 
        planet={selectedPlanet} 
        isSun={isSunSelected} 
        onClose={closeInfo}
      />
      
      <div className="absolute bottom-2 right-4 text-white/30 text-[10px]">
        滚轮缩放 • 拖拽移动 • 点击星球
      </div>
    </div>
  );
};

export default App;