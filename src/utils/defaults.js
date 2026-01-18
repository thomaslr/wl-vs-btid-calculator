// Default values for the calculator

export const DEFAULT_PROFILE = {
  currentAge: 30,
  retirementAge: 65,
  lifeExpectancy: 90,
  inflationRate: 2.5,
};

export const DEFAULT_WHOLE_LIFE = {
  annualPremium: 3500,
  paymentDuration: '10', // 'life', '10', '20', '65'
  dividendRate: 4,
  deathBenefit: 10000,
  deathBenefitMultiplier: 1,
  calibrationPoints: {
    year5: null,
    year10: null,
    year20: null,
  },
};

export const DEFAULT_BTID = {
  termCost: 567,
  termDuration: 30,
  investmentReturnRate: 7, // Net of fees
  postPremiumStrategy: 'budgetAllocation', // 'cashFlowMatch' or 'budgetAllocation'
  deathBenefit: 1000000,
};

export const PAYMENT_DURATION_OPTIONS = [
  { value: 'life', label: 'Life Pay' },
  { value: '10', label: '10 Years' },
  { value: '20', label: '20 Years' },
  { value: '65', label: 'Pay to Retirement' },
];

export const TERM_DURATION_OPTIONS = [
  { value: 10, label: '10 Years' },
  { value: 20, label: '20 Years' },
  { value: 30, label: '30 Years' },
  { value: 'retirement', label: 'Until Retirement' },
  { value: 'retirement+10', label: 'Retirement + 10 Years' },
  { value: 'retirement+20', label: 'Retirement + 20 Years' },
];

export const POST_PREMIUM_STRATEGY_OPTIONS = [
  { 
    value: 'cashFlowMatch', 
    label: 'Cash Flow Match',
    description: 'Stop investing when WL premiums would have stopped'
  },
  { 
    value: 'budgetAllocation', 
    label: 'Budget Allocation',
    description: 'Continue investing until retirement'
  },
];
