import { useState, useMemo, useEffect } from 'react';
import { Calculator, DollarSign, Info, RotateCcw } from 'lucide-react';
import ProfileInputs from './components/ProfileInputs';
import WholeLifeInputs from './components/WholeLifeInputs';
import BTIDInputs from './components/BTIDInputs';
import ComparisonTable from './components/ComparisonTable';
import BreakevenChart from './components/BreakevenChart';
import Toggle from './components/Toggle';
import { calculateScenarios } from './utils/calculations';
import { DEFAULT_PROFILE, DEFAULT_WHOLE_LIFE, DEFAULT_BTID } from './utils/defaults';

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

function App() {
  // State for all inputs - load from localStorage if available
  const [profile, setProfile] = useState(() => loadFromStorage('wl-btid-profile', DEFAULT_PROFILE));
  const [wholeLife, setWholeLife] = useState(() => loadFromStorage('wl-btid-wholelife', DEFAULT_WHOLE_LIFE));
  const [btid, setBtid] = useState(() => loadFromStorage('wl-btid-btid', DEFAULT_BTID));
  
  // Display toggles
  const [showReal, setShowReal] = useState(false);

  // Save to localStorage whenever inputs change
  useEffect(() => {
    localStorage.setItem('wl-btid-profile', JSON.stringify(profile));
  }, [profile]);
  
  useEffect(() => {
    localStorage.setItem('wl-btid-wholelife', JSON.stringify(wholeLife));
  }, [wholeLife]);
  
  useEffect(() => {
    localStorage.setItem('wl-btid-btid', JSON.stringify(btid));
  }, [btid]);

  // Reset all values to defaults
  const handleReset = () => {
    setProfile(DEFAULT_PROFILE);
    setWholeLife(DEFAULT_WHOLE_LIFE);
    setBtid(DEFAULT_BTID);
    localStorage.removeItem('wl-btid-profile');
    localStorage.removeItem('wl-btid-wholelife');
    localStorage.removeItem('wl-btid-btid');
  };

  // Validate inputs to prevent calculation errors
  const safeProfile = {
    currentAge: Math.max(18, profile.currentAge || 30),
    retirementAge: Math.max((profile.currentAge || 30) + 1, profile.retirementAge || 65),
    lifeExpectancy: Math.max((profile.retirementAge || 65) + 1, profile.lifeExpectancy || 90),
    inflationRate: Math.max(0, profile.inflationRate ?? 2.5),
  };

  const safeWholeLife = {
    annualPremium: Math.max(100, wholeLife.annualPremium || 12000),
    paymentDuration: wholeLife.paymentDuration || '20',
    dividendRate: Math.max(0, wholeLife.dividendRate ?? 4.25),
    deathBenefit: Math.max(1000, wholeLife.deathBenefit || 500000),
    deathBenefitMultiplier: Math.max(1, Math.min(5, wholeLife.deathBenefitMultiplier || 1)),
    calibrationPoints: wholeLife.calibrationPoints || { year5: null, year10: null, year20: null },
  };

  const safeBtid = {
    termCost: Math.max(0, btid.termCost || 500),
    termDuration: ['retirement', 'retirement+10', 'retirement+20'].includes(btid.termDuration) 
      ? btid.termDuration 
      : Math.max(1, btid.termDuration || 30),
    investmentReturnRate: Math.max(0, btid.investmentReturnRate ?? 7),
    postPremiumStrategy: btid.postPremiumStrategy || 'budgetAllocation',
    deathBenefit: Math.max(1000, btid.deathBenefit || 500000),
  };

  // Calculate results whenever inputs change
  const results = useMemo(() => {
    try {
      return calculateScenarios({
        // Profile
        currentAge: safeProfile.currentAge,
        retirementAge: safeProfile.retirementAge,
        lifeExpectancy: safeProfile.lifeExpectancy,
        inflationRate: safeProfile.inflationRate,
        
        // Whole Life
        wlAnnualPremium: safeWholeLife.annualPremium,
        wlPaymentDuration: safeWholeLife.paymentDuration,
        wlDividendRate: safeWholeLife.dividendRate,
        wlDeathBenefit: safeWholeLife.deathBenefit,
        wlDeathBenefitMultiplier: safeWholeLife.deathBenefitMultiplier,
        wlCalibrationPoints: safeWholeLife.calibrationPoints,
        
        // BTID
        termCost: safeBtid.termCost,
        termDuration: safeBtid.termDuration,
        investmentReturnRate: safeBtid.investmentReturnRate,
        postPremiumStrategy: safeBtid.postPremiumStrategy,
        btidDeathBenefit: safeBtid.deathBenefit,
      });
    } catch (error) {
      console.error('Calculation error:', error);
      return { wholeLifeLedger: [], btidLedger: [], breakevens: {}, summary: [] };
    }
  }, [safeProfile.currentAge, safeProfile.retirementAge, safeProfile.lifeExpectancy, safeProfile.inflationRate,
      safeWholeLife.annualPremium, safeWholeLife.paymentDuration, safeWholeLife.dividendRate, safeWholeLife.deathBenefit, safeWholeLife.deathBenefitMultiplier, safeWholeLife.calibrationPoints,
      safeBtid.termCost, safeBtid.termDuration, safeBtid.investmentReturnRate, safeBtid.postPremiumStrategy, safeBtid.deathBenefit]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calculator className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  WL vs BTID Calculator
                </h1>
                <p className="text-sm text-gray-500">
                  Whole Life vs. Term & Invest the Difference • Singapore Edition
                </p>
              </div>
            </div>
            
            {/* Global Toggle */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Reset all values to defaults"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <Toggle
                  enabled={showReal}
                  onChange={setShowReal}
                  label={showReal ? "Today's Dollars (Real)" : "Future Dollars (Nominal)"}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Toggle */}
          <div className="sm:hidden mt-4 flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset all values to defaults"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <div className="flex-1 flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <Toggle
                enabled={showReal}
                onChange={setShowReal}
                label={showReal ? "Today's Dollars (Real)" : "Future Dollars (Nominal)"}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Singapore Tax Advantage:</strong> Singapore residents pay <strong>0% capital gains tax</strong>. 
            This calculator defaults to 0% tax drag, but you can adjust for dividend withholding tax 
            (typically 0.5-1.0%) if investing in US/Global ETFs.
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ProfileInputs profile={profile} onChange={setProfile} />
          <WholeLifeInputs wholeLife={wholeLife} onChange={setWholeLife} />
          <BTIDInputs btid={btid} onChange={setBtid} wlAnnualPremium={wholeLife.annualPremium} />
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {/* Comparison Table */}
          <ComparisonTable 
            summary={results.summary} 
            showReal={showReal} 
          />

          {/* Breakeven Chart */}
          <BreakevenChart
            wholeLifeLedger={results.wholeLifeLedger}
            btidLedger={results.btidLedger}
            breakevens={results.breakevens}
            showReal={showReal}
          />
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-4 bg-gray-100 rounded-lg text-xs text-gray-600">
          <strong>Disclaimer:</strong> This calculator is for educational and illustrative purposes only. 
          It does not constitute financial advice. Actual policy performance, investment returns, and 
          tax implications may vary. Please consult a qualified financial advisor before making any 
          insurance or investment decisions. All calculations are performed client-side; no data is 
          stored or transmitted.
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm text-gray-500">
            WL vs BTID Calculator • Built for Singapore context • v1.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
