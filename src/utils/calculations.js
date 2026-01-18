/**
 * Calculation Engine for Whole Life vs BTID Comparison
 * Handles all financial calculations including:
 * - Cash Value interpolation for Whole Life
 * - Investment growth with fees and tax drag
 * - Inflation adjustments (Real vs Nominal values)
 */

/**
 * Generate a smooth cash value curve using polynomial interpolation
 * based on user-provided calibration points (Year 5, 10, 20)
 */
export function interpolateCashValue(calibrationPoints, maxYears, annualPremium) {
  const { year5, year10, year20 } = calibrationPoints;
  
  // If no calibration points provided, use a standard model
  if (!year5 && !year10 && !year20) {
    return generateStandardCashValueCurve(maxYears, annualPremium);
  }
  
  // Use cubic spline-like interpolation
  const points = [];
  if (year5) points.push({ year: 5, value: year5 });
  if (year10) points.push({ year: 10, value: year10 });
  if (year20) points.push({ year: 20, value: year20 });
  
  // Add implicit points
  points.unshift({ year: 0, value: 0 });
  points.unshift({ year: 1, value: 0 }); // Years 1-2 typically have 0 surrender value
  points.unshift({ year: 2, value: 0 });
  
  // Sort by year
  points.sort((a, b) => a.year - b.year);
  
  const cashValues = new Array(maxYears + 1).fill(0);
  
  for (let year = 0; year <= maxYears; year++) {
    // Find surrounding points for interpolation
    let lowerPoint = points[0];
    let upperPoint = points[points.length - 1];
    
    for (let i = 0; i < points.length - 1; i++) {
      if (points[i].year <= year && points[i + 1].year >= year) {
        lowerPoint = points[i];
        upperPoint = points[i + 1];
        break;
      }
    }
    
    if (year <= lowerPoint.year) {
      cashValues[year] = lowerPoint.value;
    } else if (year >= upperPoint.year) {
      // Extrapolate beyond year 20 using the growth rate from year 10-20
      const growthRate = points.length > 1 ? 
        Math.pow(points[points.length - 1].value / points[points.length - 2].value, 
                 1 / (points[points.length - 1].year - points[points.length - 2].year)) - 1 : 
        0.04;
      const yearsExtra = year - upperPoint.year;
      cashValues[year] = upperPoint.value * Math.pow(1 + growthRate, yearsExtra);
    } else {
      // Linear interpolation between points
      const ratio = (year - lowerPoint.year) / (upperPoint.year - lowerPoint.year);
      cashValues[year] = lowerPoint.value + (upperPoint.value - lowerPoint.value) * ratio;
    }
  }
  
  return cashValues;
}

/**
 * Generate a standard cash value curve when no calibration points provided
 * Models typical whole life policy behavior
 */
function generateStandardCashValueCurve(maxYears, annualPremium) {
  const cashValues = new Array(maxYears + 1).fill(0);
  
  for (let year = 0; year <= maxYears; year++) {
    if (year <= 2) {
      // Years 1-2: Minimal to no cash value (surrender charges)
      cashValues[year] = 0;
    } else if (year <= 5) {
      // Years 3-5: Building slowly
      cashValues[year] = annualPremium * (year - 2) * 0.3;
    } else if (year <= 10) {
      // Years 6-10: Accelerating
      cashValues[year] = annualPremium * 3 * 0.3 + annualPremium * (year - 5) * 0.6;
    } else {
      // Beyond year 10: Steady growth
      const year10Value = annualPremium * 3 * 0.3 + annualPremium * 5 * 0.6;
      cashValues[year] = year10Value * Math.pow(1.04, year - 10);
    }
  }
  
  return cashValues;
}

/**
 * Calculate death benefit including paid-up additions
 */
export function calculateDeathBenefit(baseBenefit, cashValue, dividendRate, year) {
  // Paid-up additions grow with dividends
  const paidUpAdditions = cashValue * (dividendRate / 100) * Math.min(year, 20) * 0.1;
  return baseBenefit + paidUpAdditions;
}

/**
 * Get premium payment years based on payment duration
 */
export function getPaymentYears(paymentDuration, currentAge, retirementAge) {
  switch (paymentDuration) {
    case 'life':
      return 100 - currentAge;
    case '10':
      return 10;
    case '20':
      return 20;
    case '65':
      // Use the actual retirement age instead of hardcoded 65
      return Math.max(0, retirementAge - currentAge);
    default:
      return 100 - currentAge;
  }
}

/**
 * Main calculation function - generates year-by-year ledgers for both scenarios
 */
export function calculateScenarios(inputs) {
  const {
    // Profile
    currentAge,
    retirementAge,
    lifeExpectancy,
    inflationRate,
    
    // Whole Life
    wlAnnualPremium,
    wlPaymentDuration,
    wlDividendRate,
    wlDeathBenefit,
    wlDeathBenefitMultiplier,
    wlCalibrationPoints,
    
    // BTID
    termCost,
    termDuration,
    btidDeathBenefit,
    investmentReturnRate, // Net of fees
    postPremiumStrategy, // 'cashFlowMatch' or 'budgetAllocation'
  } = inputs;
  
  // Guard against invalid inputs
  const safeCurrentAge = Math.max(18, currentAge || 30);
  const safeLifeExpectancy = Math.max(safeCurrentAge + 1, lifeExpectancy || 90);
  const maxYears = Math.max(1, safeLifeExpectancy - safeCurrentAge);
  const wlPaymentYears = getPaymentYears(wlPaymentDuration, safeCurrentAge, retirementAge);
  
  // Initialize ledgers
  const wholeLifeLedger = [];
  const btidLedger = [];
  
  // Generate cash value curve
  const safeAnnualPremium = Math.max(100, wlAnnualPremium || 12000);
  const cashValues = interpolateCashValue(wlCalibrationPoints, maxYears, safeAnnualPremium);
  
  // Calculate year by year
  let wlTotalPremiumsPaid = 0;
  let termTotalPremiumsPaid = 0;
  let investmentBalance = 0;
  
  const safeInflationRate = Math.max(0, inflationRate ?? 2.5);
  const safeWlDeathBenefit = Math.max(1000, wlDeathBenefit || 500000);
  const safeBtidDeathBenefit = Math.max(1000, btidDeathBenefit || 500000);
  const safeDividendRate = Math.max(0, wlDividendRate ?? 4.25);
  const safeTermCost = Math.max(0, termCost || 0);
  // Handle term duration - can be a number or 'retirement', 'retirement+10', 'retirement+20'
  let safeTermDuration;
  if (termDuration === 'retirement') {
    safeTermDuration = Math.max(safeCurrentAge + 1, retirementAge || 65) - safeCurrentAge;
  } else if (termDuration === 'retirement+10') {
    safeTermDuration = Math.max(safeCurrentAge + 1, (retirementAge || 65) + 10) - safeCurrentAge;
  } else if (termDuration === 'retirement+20') {
    safeTermDuration = Math.max(safeCurrentAge + 1, (retirementAge || 65) + 20) - safeCurrentAge;
  } else {
    safeTermDuration = Math.max(1, termDuration || 30);
  }
  const safeReturnRate = investmentReturnRate ?? 7; // Already net of fees
  const safeRetirementAge = Math.max(safeCurrentAge + 1, retirementAge || 65);
  
  for (let year = 0; year <= maxYears; year++) {
    const age = safeCurrentAge + year;
    
    // --- Whole Life Calculations ---
    const wlPremiumThisYear = year < wlPaymentYears ? safeAnnualPremium : 0;
    wlTotalPremiumsPaid += wlPremiumThisYear;
    
    const wlCashValue = cashValues[year] || 0;
    // Apply multiplier to death benefit until retirement age
    const currentDeathBenefit = age < retirementAge 
      ? safeWlDeathBenefit * (wlDeathBenefitMultiplier || 1)
      : safeWlDeathBenefit;
    
    const wlDeathBenefitTotal = calculateDeathBenefit(
      currentDeathBenefit, 
      wlCashValue, 
      safeDividendRate, 
      year
    );
    
    // --- BTID Calculations ---
    const termActive = year < safeTermDuration;
    const termPremiumThisYear = termActive ? safeTermCost : 0;
    termTotalPremiumsPaid += termPremiumThisYear;
    
    const termDeathBenefit = termActive ? safeBtidDeathBenefit : 0;
    
    // Investment contribution logic
    let investmentContribution = 0;
    if (postPremiumStrategy === 'cashFlowMatch') {
      // Match WL premium schedule
      if (year < wlPaymentYears) {
        investmentContribution = Math.max(0, safeAnnualPremium - termPremiumThisYear);
      }
    } else {
      // Budget allocation - continue investing until retirement
      const yearsToRetirement = safeRetirementAge - safeCurrentAge;
      if (year < yearsToRetirement) {
        if (termActive) {
          investmentContribution = Math.max(0, safeAnnualPremium - safeTermCost);
        } else {
          investmentContribution = safeAnnualPremium; // Term expired, invest full amount
        }
      }
    }
    
    // Investment growth calculation
    if (year > 0) {
      const netReturnRate = safeReturnRate / 100; // Already net of fees
      investmentBalance = investmentBalance * (1 + netReturnRate) + investmentContribution;
    } else {
      investmentBalance = investmentContribution;
    }
    
    const btidTotalEstateValue = investmentBalance + termDeathBenefit;
    
    // Calculate real (inflation-adjusted) values
    const inflationFactor = Math.pow(1 + safeInflationRate / 100, year);
    
    wholeLifeLedger.push({
      year,
      age,
      premiumPaid: wlPremiumThisYear,
      totalPremiumsPaid: wlTotalPremiumsPaid,
      cashValue: wlCashValue,
      deathBenefit: wlDeathBenefitTotal,
      // Real values
      cashValueReal: wlCashValue / inflationFactor,
      deathBenefitReal: wlDeathBenefitTotal / inflationFactor,
      totalPremiumsPaidReal: wlTotalPremiumsPaid / inflationFactor,
    });
    
    btidLedger.push({
      year,
      age,
      termPremium: termPremiumThisYear,
      termActive,
      termDeathBenefit,
      investmentContribution,
      investmentBalance,
      totalPremiumsPaid: termTotalPremiumsPaid,
      totalEstateValue: btidTotalEstateValue,
      // Real values
      investmentBalanceReal: investmentBalance / inflationFactor,
      termDeathBenefitReal: termDeathBenefit / inflationFactor,
      totalEstateValueReal: btidTotalEstateValue / inflationFactor,
      totalPremiumsPaidReal: termTotalPremiumsPaid / inflationFactor,
    });
  }
  
  // Find breakeven points
  const breakevens = findBreakevenPoints(wholeLifeLedger, btidLedger);
  
  return {
    wholeLifeLedger,
    btidLedger,
    breakevens,
    summary: generateSummary(wholeLifeLedger, btidLedger, inputs),
  };
}

/**
 * Find crossover points between the two strategies
 */
function findBreakevenPoints(wlLedger, btidLedger) {
  const breakevens = {
    investmentVsCashValue: null,
    wlDeathBenefitVsInvestment: null,
  };
  
  for (let i = 1; i < wlLedger.length; i++) {
    // Investment crosses above Cash Value
    if (
      !breakevens.investmentVsCashValue &&
      btidLedger[i - 1].investmentBalance < wlLedger[i - 1].cashValue &&
      btidLedger[i].investmentBalance >= wlLedger[i].cashValue
    ) {
      breakevens.investmentVsCashValue = {
        year: i,
        age: wlLedger[i].age,
      };
    }
    
    // WL Death Benefit crosses above Total Investment (late in life)
    if (
      !breakevens.wlDeathBenefitVsInvestment &&
      wlLedger[i - 1].deathBenefit < btidLedger[i - 1].totalEstateValue &&
      wlLedger[i].deathBenefit >= btidLedger[i].totalEstateValue
    ) {
      breakevens.wlDeathBenefitVsInvestment = {
        year: i,
        age: wlLedger[i].age,
      };
    }
  }
  
  return breakevens;
}

/**
 * Generate summary statistics at key ages
 */
function generateSummary(wlLedger, btidLedger, inputs) {
  const { currentAge } = inputs;
  const safeCurrentAge = Math.max(18, currentAge || 30);
  const targetAges = [safeCurrentAge + 10, 45, 65, 85].filter(age => age > safeCurrentAge);
  
  const summaryRows = [];
  
  for (const targetAge of targetAges) {
    const wlEntry = wlLedger.find(entry => entry.age === targetAge);
    const btidEntry = btidLedger.find(entry => entry.age === targetAge);
    
    if (wlEntry && btidEntry) {
      summaryRows.push({
        age: targetAge,
        wl: {
          totalPremiums: wlEntry.totalPremiumsPaid,
          totalPremiumsReal: wlEntry.totalPremiumsPaidReal,
          liquidity: wlEntry.cashValue,
          liquidityReal: wlEntry.cashValueReal,
          estateValue: wlEntry.deathBenefit,
          estateValueReal: wlEntry.deathBenefitReal,
        },
        btid: {
          totalPremiums: btidEntry.totalPremiumsPaid,
          totalPremiumsReal: btidEntry.totalPremiumsPaidReal,
          liquidity: btidEntry.investmentBalance,
          liquidityReal: btidEntry.investmentBalanceReal,
          estateValue: btidEntry.totalEstateValue,
          estateValueReal: btidEntry.totalEstateValueReal,
        },
      });
    }
  }
  
  return summaryRows;
}

/**
 * Format currency for display
 */
export function formatCurrency(value, compact = false) {
  if (value === undefined || value === null || isNaN(value)) return '-';
  
  if (compact && Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  } else if (compact && Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercentage(value) {
  if (value === undefined || value === null || isNaN(value)) return '-';
  return `${value.toFixed(2)}%`;
}
