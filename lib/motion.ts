// Shared motion tokens so every animation on the site feels consistent.
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.76, 0, 0.24, 1];
export const DURATION = { fast: 0.25, base: 0.5, slow: 0.8 } as const;

// Default props for the BlurText heading reveal, used everywhere.
export const BLUR_DEFAULTS = { delay: 80, animateBy: "words", direction: "bottom" } as const;
