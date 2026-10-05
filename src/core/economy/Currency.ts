const formatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatMoney(amount: number): string {
  const rounded = Math.floor(amount);
  if (Math.abs(rounded) >= 1_000_000) return `$${(rounded / 1_000_000).toFixed(2)}M`;
  return `$${formatter.format(rounded)}`;
}
