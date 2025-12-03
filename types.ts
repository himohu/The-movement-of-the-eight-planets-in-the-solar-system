export interface PlanetData {
  id: string;
  name: string;
  color: string; // Base color
  size: number; // Relative radius for display
  distance: number; // Distance from sun
  speed: number; // Orbital speed multiplier
  description: string;
  hasRings?: boolean;
  ringColor?: string;
  ringSize?: number;
  // Visual specific properties
  type: 'star' | 'terrestrial' | 'gas_giant' | 'ice_giant';
  textureColors?: string[]; // For bands or noise
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface SimulationState {
  zoom: number;
  offset: Vector2;
  speedMultiplier: number;
  showOrbits: boolean;
  isPaused: boolean;
  focusedBodyId: string | null; // 'sun' or planet ID
}

export type PlanetFactResponse = {
  fact: string;
  category: string;
};