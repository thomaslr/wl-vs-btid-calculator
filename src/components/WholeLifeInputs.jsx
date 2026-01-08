import { Shield, DollarSign, Info } from 'lucide-react';
import { PAYMENT_DURATION_OPTIONS } from '../utils/defaults';

export default function WholeLifeInputs({ wholeLife, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...wholeLife, [field]: value });
  };

  const handleCalibrationChange = (field, value) => {
    onChange({
      ...wholeLife,
      calibrationPoints: {
        ...wholeLife.calibrationPoints,
        [field]: value === '' ? null : parseFloat(value) || null,
      },
    });
  };

  return (
    <div className="card border-l-4 border-l-wl">
      <h3 className="section-title">
        <Shield className="w-5 h-5 text-wl" />
        Whole Life Policy (Scenario A)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="input-group">
          <label className="input-label" htmlFor="wlAnnualPremium">
            Annual Premium
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="wlAnnualPremium"
              className="input-field pl-7"
              value={wholeLife.annualPremium}
              onChange={(e) => handleChange('annualPremium', parseInt(e.target.value) || 0)}
              min={1000}
              step={500}
            />
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="wlPaymentDuration">
            Payment Duration (years)
          </label>
          <select
            id="wlPaymentDuration"
            className="input-field"
            value={wholeLife.paymentDuration}
            onChange={(e) => handleChange('paymentDuration', e.target.value)}
          >
            {PAYMENT_DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="input-group">
          <label className="input-label" htmlFor="wlDividendRate">
            Dividend Interest Rate
            <span className="text-xs text-gray-500 ml-1">(%)</span>
          </label>
          <input
            type="number"
            id="wlDividendRate"
            className="input-field"
            value={wholeLife.dividendRate}
            onChange={(e) => handleChange('dividendRate', parseFloat(e.target.value) || 0)}
            min={0}
            max={10}
            step={0.25}
          />
        </div>
      </div>
      
      {/* Cash Value Calibration */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary-600" />
          <h4 className="text-sm font-medium text-gray-700">
            Cash Value Calibration (Optional)
          </h4>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Enter "Total Surrender Value" from your policy illustration to generate an accurate projection.
          Leave blank to use standard estimates.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="input-group mb-0">
            <label className="input-label" htmlFor="cvYear5">
              Year 5 Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="cvYear5"
                className="input-field pl-7"
                placeholder="e.g. 25000"
                value={wholeLife.calibrationPoints.year5 || ''}
                onChange={(e) => handleCalibrationChange('year5', e.target.value)}
                min={0}
              />
            </div>
          </div>
          
          <div className="input-group mb-0">
            <label className="input-label" htmlFor="cvYear10">
              Year 10 Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="cvYear10"
                className="input-field pl-7"
                placeholder="e.g. 85000"
                value={wholeLife.calibrationPoints.year10 || ''}
                onChange={(e) => handleCalibrationChange('year10', e.target.value)}
                min={0}
              />
            </div>
          </div>
          
          <div className="input-group mb-0">
            <label className="input-label" htmlFor="cvYear20">
              Year 20 Value
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="cvYear20"
                className="input-field pl-7"
                placeholder="e.g. 200000"
                value={wholeLife.calibrationPoints.year20 || ''}
                onChange={(e) => handleCalibrationChange('year20', e.target.value)}
                min={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
