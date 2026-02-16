/**
 * Inflation-adjusted future value: FV = PV * (1 + r)^n
 * r = real rate = (1 + nominal) / (1 + inflation) - 1
 * Or simple: futureValue = presentValue * (1 + nominalRate - inflationRate)^years
 */
export function futureValueWithInflation(
  presentValue: number,
  years: number,
  nominalGrowthRate: number = 0.07,
  inflationRate: number = 0.03
): number {
  const realRate = (1 + nominalGrowthRate) / (1 + inflationRate) - 1;
  return presentValue * Math.pow(1 + realRate, years);
}

/**
 * Today's value in future terms (how much you need to have the same purchasing power)
 * FV = PV * (1 + inflation)^n
 */
export function inflationAdjustedFuture(
  presentValue: number,
  years: number,
  inflationRate: number = 0.03
): number {
  return presentValue * Math.pow(1 + inflationRate, years);
}

/**
 * Real (inflation-adjusted) value of a past amount today
 * PV = pastValue * (1 + inflation)^years
 */
export function todayValueOfPast(
  pastValue: number,
  yearsAgo: number,
  inflationRate: number = 0.03
): number {
  return pastValue * Math.pow(1 + inflationRate, yearsAgo);
}
