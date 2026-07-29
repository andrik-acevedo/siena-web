/**
 * Preset categories + colors (solid hex).
 * We store ONLY the solid hex in DB; gradients are for UI if you want them.
 */
export type CoupleTypePreset = {
  name: string;
  color: string;            // solid hex used for dots/chips
};

export const DEFAULT_COUPLE_TYPES: CoupleTypePreset[] = [
  { name: 'Intimacy',                 color: '#8e4f63' },
  { name: 'Conflict',                 color: '#E03B3B' },
  { name: 'Check-ins',                color: '#006a70' },
  { name: 'Date Nights',              color: '#B36B00' },
  { name: 'Quality Time',             color: '#018a88' },
  { name: 'New Experiences',          color: '#5d4070' },
  { name: 'Rituals',                  color: '#6C8300' },
  { name: 'Family Time',              color: '#6A51A6' },
  { name: 'Friend Time',              color: '#5d4070' },
  { name: 'Trips & Travel',           color: '#004d7f' },
  { name: 'Celebrations & Surprises', color: '#FFA600' },
  { name: 'Growth & Support',         color: '#006a70' },
];