// Utility types and functions for measurement conversion

export interface FractionResult {
  whole: number;
  numerator: number;
  denominator: number;
  decimal: number;
  error: number; // Difference between input decimal and fraction
}

// Find the nearest fraction with a maximum denominator (e.g., 16, 32, 64)
export const decimalToFraction = (value: number, maxDenominator: number = 16): FractionResult => {
  const whole = Math.floor(value);
  const decimalPart = value - whole;
  
  // Handle exact whole numbers
  if (Math.abs(decimalPart) < 0.0001) {
    return { whole, numerator: 0, denominator: 1, decimal: value, error: 0 };
  }

  let bestNumerator = 1;
  let bestDenominator = 1;
  let minError = Math.abs(decimalPart - bestNumerator / bestDenominator);

  // Iterate through denominators to find the best match within tolerance
  for (let d = 2; d <= maxDenominator; d *= 2) {
    const n = Math.round(decimalPart * d);
    const error = Math.abs(decimalPart - n / d);
    
    // Prefer smaller denominators if error is roughly equal (floating point safety)
    if (error < minError - 0.00001) { // slight bias to higher precision if significantly better
      bestNumerator = n;
      bestDenominator = d;
      minError = error;
    } else if (Math.abs(error - minError) < 0.00001) {
       // If errors are effectively same, check if we can simplify
       // (This loop structure naturally prefers larger denominators if we just update, 
       // but we want the simplest form. Since we loop 2,4,8,16, we update if strictly better)
       // Actually, simplified forms are naturally found at lower d. 
       // e.g. 0.5 -> 1/2 (d=2, err=0). Next loop d=4, n=2, err=0. Not strictly better, so we keep 1/2.
    }
  }

  // Simplify fraction if possible (though the power-of-two loop logic above mostly handles it)
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const commonDivisor = gcd(bestNumerator, bestDenominator);
  
  return {
    whole,
    numerator: bestNumerator / commonDivisor,
    denominator: bestDenominator / commonDivisor,
    decimal: value,
    error: minError
  };
};

export const formatFraction = (result: FractionResult): string => {
  if (result.numerator === 0 || result.numerator === result.denominator) {
    return `${result.numerator === result.denominator ? result.whole + 1 : result.whole}"`;
  }
  
  if (result.whole === 0) {
    return `${result.numerator}/${result.denominator}"`;
  }

  return `${result.whole} ${result.numerator}/${result.denominator}"`;
};
