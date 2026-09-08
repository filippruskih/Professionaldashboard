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
      <path d="M2.5 19 L6.2 4.5 L9.9 19" />
      <path d="M4 13.5 L8.4 13.5" />
      <path d="M12.8 4.5 L12.8 19" />
      <path d="M16.5 7.2 L21.5 7.2" />
      <path d="M19 4.7 L19 9.7" />
    </svg>
  );
}
