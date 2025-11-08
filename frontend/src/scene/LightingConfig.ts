/**
 * Lighting configuration presets for different times of day
 */

export interface LightingPreset {
  name: string;
  directionalLight: {
    color: number;
    intensity: number;
    position: { x: number; y: number; z: number };
  };
  ambientLight: {
    color: number;
    intensity: number;
  };
  skyColor: number;
  fogColor: number;
}

export const LIGHTING_PRESETS: Record<string, LightingPreset> = {
  morning: {
    name: 'Morning',
    directionalLight: {
      color: 0xffd4a3, // Soft golden morning light
      intensity: 2.0,
      position: { x: 30, y: 40, z: 60 }, // Sun rising from the side
    },
    ambientLight: {
      color: 0xb8d4ff, // Cool blue ambient
      intensity: 0.6,
    },
    skyColor: 0xffc4a3, // Peachy morning sky
    fogColor: 0xffb89d,
  },

  day: {
    name: 'Day',
    directionalLight: {
      color: 0xfff5e1, // Bright white-yellow daylight
      intensity: 2.8,
      position: { x: 50, y: 80, z: 25 }, // High overhead sun
    },
    ambientLight: {
      color: 0xe6f2ff, // Bright blue-white ambient
      intensity: 0.9,
    },
    skyColor: 0x87ceeb, // Clear blue sky
    fogColor: 0xa8d8ea,
  },

  afternoon: {
    name: 'Afternoon',
    directionalLight: {
      color: 0xffaa66, // Warm orange
      intensity: 2.5,
      position: { x: 60, y: 30, z: 40 }, // Lower sun angle
    },
    ambientLight: {
      color: 0xffcc99, // Warm peachy ambient
      intensity: 0.8,
    },
    skyColor: 0xffb870, // Warm sunset orange-pink
    fogColor: 0xffa060,
  },

  night: {
    name: 'Night',
    directionalLight: {
      color: 0xddeeff, // White-ish silvery moonlight
      intensity: 0.8,
      position: { x: -40, y: 60, z: 30 }, // Moon position
    },
    ambientLight: {
      color: 0x1a1a3a, // Dark blue ambient
      intensity: 0.3,
    },
    skyColor: 0x0d1117, // Dark night sky
    fogColor: 0x1a1a2e,
  },
};

export type LightingTime = 'morning' | 'day' | 'afternoon' | 'night';

