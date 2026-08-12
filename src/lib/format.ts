const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function formatCompactNumber(value: number): string {
  return compactFormatter.format(value);
}

export function formatPercent(value: number, fractionDigits = 1): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function formatSignedCompactNumber(value: number): string {
  const formatted = compactFormatter.format(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatSecondsFromMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

export function formatSignedPercent(value: number, fractionDigits = 0): string {
  const formatted = `${Math.abs(value * 100).toFixed(fractionDigits)}%`;
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
