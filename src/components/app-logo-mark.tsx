// Original monogram — "AI" for the agents, with a small "+" accent for
// growth — drawn as strokes so it matches the weight/style of the lucide
// icons used everywhere else in the app, rather than relying on a
// rendered font (which would look inconsistent between this live SVG and
// the pre-rasterized PNG app icons built from the same path data — see
// scripts/gen-icons.mjs).
export function AppLogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2.8 19 L6 4.5 L9.2 19" />
      <path d="M4.5 13.5 L7.5 13.5" />
      <path d="M11 4.5 L11 19" />
      <path d="M12.8 6 L16.8 6" />
      <path d="M14.8 4 L14.8 8" />
    </svg>
  );
}
