// Simple FX rates (USD base). In production, use a provider updated every 6h.
const RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.12,
  JPY: 149.5,
};

export function toBase(amount: number, fromCurrency: string, baseCurrency: string): number {
  if (fromCurrency === baseCurrency) return amount;
  const fromRate = RATES[fromCurrency] ?? 1;
  const baseRate = RATES[baseCurrency] ?? 1;
  return (amount * baseRate) / fromRate;
}

export function getRate(toCurrency: string, fromCurrency: string = "USD"): number {
  const from = RATES[fromCurrency] ?? 1;
  const to = RATES[toCurrency] ?? 1;
  return to / from;
}

export function supportedCurrencies(): string[] {
  return Object.keys(RATES);
}
