import React, { useRef, useEffect } from 'react';
import { PLANETS, SUN_DATA } from '../constants';
import { Vector2, PlanetData } from '../types';

interface SolarSystemCanvasProps {
  zoom: number;
  offset: Vector2;
  speedMultiplier: number;
  isPaused: boolean;
  showOrbits: boolean;
  focusedBodyId: string | null;
  onPlanetSelect: (id: string) => void;
  setOffset: (offset: Vector2) => void;
}

const SolarSystemCanvas: React.FC<SolarSystemCanvasProps> = ({
  zoom,
  offset,
  speedMultiplier,
  isPaused,
  showOrbits,
  focusedBodyId,
  onPlanetSelect,
  setOffset
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const simulationTimeRef = useRef<number>(0);
  
  const positionsRef = useRef<Map<string, { x: number, y: number, r: number }>>(new Map());

  // Handle Dragging
  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef<Vector2>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      
      if (focusedBodyId && (Math.abs(dx) > 1 || Math.abs(dy) > 1)) {
         onPlanetSelect(''); 
      }

      setOffset({
        x: offset.x + dx,
        y: offset.y + dy
      });
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let clickedId: string | null = null;
    let minDist = Infinity;

    positionsRef.current.forEach((pos, id) => {
      const hitRadius = Math.max(pos.r * zoom, 20); // Larger hit area
      const dx = clickX - pos.x;
      const dy = clickY - pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < hitRadius && dist < minDist) {
        minDist = dist;
        clickedId = id;
      }
    });

    if (clickedId) {
      onPlanetSelect(clickedId);
    }
  };

  const drawPlanet3D = (
    ctx: CanvasRenderingContext2D, 
    planet: PlanetData | typeof SUN_DATA, 
    x: number, 
    y: number, 
    radius: number,
    simTime: number
  ) => {
    ctx.save();
    ctx.translate(x, y);

    if (planet.type === 'star') {
      // --- SUN RENDER ---
      // 1. Corona Glow
      const glow = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius * 3);
      glow.addColorStop(0, 'rgba(255, 200, 0, 0.8)');
      glow.addColorStop(0.2, 'rgba(255, 100, 0, 0.4)');
      glow.addColorStop(1, 'rgba(255, 50, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Core Surface
      const sunBody = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      sunBody.addColorStop(0, '#FFF5DD');
      sunBody.addColorStop(0.3, '#FFD700');
      sunBody.addColorStop(0.9, '#FF8C00');
      sunBody.addColorStop(1, '#FF4500');
      ctx.fillStyle = sunBody;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

    } else {
      // --- PLANET RENDER ---
      
      // Calculate angle to Sun (Sun is always at 0,0 world space)
      // Since we are at (x, y) relative to sun, the sun is at (-x, -y) relative to us.
      // We want to rotate the context so the "Sun side" is to the left (or define gradient direction).
      // Math.atan2(y, x) gives angle of planet. 
      // Sun is at angle + PI.
      const angleToSun = Math.atan2(-y, -x);

      ctx.rotate(angleToSun);

      // Planet Base Circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      
      // 1. Base Texture / Color
      // We create a clipping region for texture
      ctx.save();
      ctx.clip();

      const pData = planet as PlanetData;

      if (pData.type === 'gas_giant' && pData.textureColors) {
        // Draw Bands
        const colors = pData.textureColors;
        const bandHeight = (radius * 2) / colors.length;
        // Rotate back slightly for bands to be "horizontal" relative to planet axis, 
        // but here we just draw vertical stripes since we rotated towards sun?
        // Let's keep bands perpendicular to rotation axis. 
        // Usually planets rotate; we can simulate rotation by offset.
        // For simplicity: Draw bands along Y axis (since we rotated to face sun on X).
        // Actually, bands should be perpendicular to the planet's rotation axis.
        // Let's assume axis is vertical. 
        // We rotated the whole coordinate system to point X at sun.
        // So we need to un-rotate to draw "native" surface features, then apply shadow.
        ctx.rotate(-angleToSun); // Undo rotation to draw surface
        
        // Tilt axis
        ctx.rotate(Math.PI * 0.1); 

        colors.forEach((c, i) => {
          ctx.fillStyle = c;
          ctx.fillRect(-radius, -radius + (i * bandHeight), radius * 2, bandHeight + 1);
        });
        
        ctx.rotate(-Math.PI * 0.1);
        ctx.rotate(angleToSun); // Re-apply sun rotation for shadow
      
      } else if (pData.id === 'earth' && pData.textureColors) {
        // Earth-like
        ctx.rotate(-angleToSun); // Draw naturally
        // Ocean
        ctx.fillStyle = pData.textureColors[0];
        ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
        
        // Continents (Procedural-ish blobs)
        ctx.fillStyle = pData.textureColors[1];
        // Simple distinct shapes rotating
        const rot = simTime * 0.5;
        for(let i=0; i<3; i++) {
           const cx = Math.sin(rot + i*2) * radius * 0.6;
           const cy = Math.cos(rot + i*2) * radius * 0.4;
           ctx.beginPath();
           ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
           ctx.fill();
        }
        ctx.rotate(angleToSun); // Restore

      } else {
         // Generic
         ctx.fillStyle = planet.color;
         ctx.fillRect(-radius, -radius, radius * 2, radius * 2);
      }
      
      ctx.restore(); // End texture clip

      // 2. 3D Shading (Shadow & Highlight)
      // Light comes from Right (Angle 0) because we rotated ctx.rotate(angleToSun)
      // Actually, atan2(-y, -x) points TO the sun. So Sun is at positive X axis in this local space.
      
      // Radial Gradient for 3D sphere feel
      // Center of gradient is shifted towards Sun (positive x)
      const gradient = ctx.createRadialGradient(
        radius * 0.4, 0, 0, // Highlight center (towards sun)
        0, 0, radius // Outer dark
      );
      
      // Specular highlight (very subtle)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)'); 
      // Transparent middle to let texture show
      gradient.addColorStop(0.4, 'rgba(0, 0, 0, 0)');
      // Shadow on the back side
      gradient.addColorStop(0.8, 'rgba(0,0,0, 0.5)'); 
      gradient.addColorStop(1, 'rgba(0,0,0, 0.9)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();

      // 3. Rings (Saturn)
      if ((planet as PlanetData).hasRings) {
        // Rings need to be drawn "around" the planet.
        // To look 3D, we usually draw back half, then planet, then front half.
        // But here we just draw an ellipse.
        // We need to undo the lighting rotation to place rings correctly (equatorial).
        ctx.rotate(-angleToSun);
        
        ctx.save();
        ctx.scale(1, 0.3); // Flatten Y to make ellipse
        
        ctx.beginPath();
        ctx.arc(0, 0, (planet as PlanetData).ringSize!, 0, Math.PI * 2);
        
        // Ring Gradient
        const rGrad = ctx.createRadialGradient(0,0, radius, 0,0, (planet as PlanetData).ringSize!);
        rGrad.addColorStop(0, 'rgba(0,0,0,0)');
        rGrad.addColorStop(0.4, (planet as PlanetData).ringColor || '#FFF');
        rGrad.addColorStop(0.7, 'rgba(0,0,0,0)'); // Gap
        rGrad.addColorStop(1, (planet as PlanetData).ringColor || '#FFF');
        
        ctx.fillStyle = rGrad;
        ctx.fill();
        ctx.restore();
      }

    }
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = (time: number) => {
      // 1. Setup Delta Time
      if (lastTimeRef.current === 0) lastTimeRef.current = time;
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // 2. Update Simulation Time
      if (!isPaused) {
        simulationTimeRef.current += deltaTime * 0.001 * speedMultiplier;
      }
      const simTime = simulationTimeRef.current;

      // 3. Canvas Resizing
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 4. Calculate Logic Positions
      const planetPositions = PLANETS.map(p => {
        const angle = simTime * p.speed;
        return {
          id: p.id,
          x: Math.cos(angle) * p.distance,
          y: Math.sin(angle) * p.distance,
          data: p
        };
      });

      // 5. Camera Logic
      let targetOffsetX = offset.x;
      let targetOffsetY = offset.y;

      if (focusedBodyId) {
        if (focusedBodyId === 'sun') {
          targetOffsetX = 0;
          targetOffsetY = 0;
        } else {
          const targetP = planetPositions.find(p => p.id === focusedBodyId);
          if (targetP) {
            // Center the planet
            const px = targetP.x * zoom;
            const py = targetP.y * zoom;
            targetOffsetX = -px;
            targetOffsetY = -py;
          }
        }
      }

      const renderOffsetX = focusedBodyId ? targetOffsetX : offset.x;
      const renderOffsetY = focusedBodyId ? targetOffsetY : offset.y;

      // 6. Draw Background
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Starfield
      ctx.save();
      ctx.fillStyle = '#FFF';
      // Use a consistent seed for stars so they don't jitter
      for(let i=0; i<150; i++) {
         // Pseudo-random pos based on index
         const x = ((Math.sin(i * 123.45) * 10000) % canvas.width + canvas.width) % canvas.width;
         const y = ((Math.cos(i * 678.90) * 10000) % canvas.height + canvas.height) % canvas.height;
         const size = (Math.sin(i * 32.1) + 1.5) * 0.8;
         const blink = Math.sin(time * 0.002 + i) * 0.3 + 0.7;
         ctx.globalAlpha = blink;
         ctx.beginPath();
         ctx.arc(x, y, size, 0, Math.PI * 2);
         ctx.fill();
      }
      ctx.restore();

      // 7. Apply Camera
      ctx.save();
      ctx.translate(centerX + renderOffsetX, centerY + renderOffsetY);
      ctx.scale(zoom, zoom);

      positionsRef.current.clear();

      // 8. Draw Orbits
      if (showOrbits) {
        ctx.lineWidth = 1 / zoom;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        PLANETS.forEach(p => {
          ctx.beginPath();
          ctx.arc(0, 0, p.distance, 0, Math.PI * 2);
          ctx.stroke();
        });
      }

      // 9. Draw Sun
      // Store Sun pos
      const sunScreenX = (centerX + renderOffsetX);
      const sunScreenY = (centerY + renderOffsetY);
      positionsRef.current.set('sun', { x: sunScreenX, y: sunScreenY, r: SUN_DATA.size });
      
      drawPlanet3D(ctx, SUN_DATA, 0, 0, SUN_DATA.size, simTime);

      // 10. Draw Planets (Sorted by Y for slight depth sorting if they overlap, though rare in 2D top down)
      // Actually standard Z-order is fine here.
      planetPositions.forEach((pos) => {
        
        drawPlanet3D(ctx, pos.data, pos.x, pos.y, pos.data.size, simTime);

        // Selection Highlight
        if (focusedBodyId === pos.id) {
            ctx.save();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2 / zoom;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, pos.data.size * 1.4, 0, Math.PI*2);
            ctx.setLineDash([4/zoom, 4/zoom]);
            ctx.stroke();
            ctx.restore();
        }

        // Store Screen Coordinates
        const screenX = centerX + renderOffsetX + (pos.x * zoom);
        const screenY = centerY + renderOffsetY + (pos.y * zoom);
        positionsRef.current.set(pos.id, { x: screenX, y: screenY, r: pos.data.size });
      });

      ctx.restore();

      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [zoom, offset, speedMultiplier, isPaused, showOrbits, focusedBodyId]);

  return (
    <canvas
      ref={canvasRef}
      className="block absolute top-0 left-0 w-full h-full cursor-move"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    />
  );
};

export default SolarSystemCanvas;