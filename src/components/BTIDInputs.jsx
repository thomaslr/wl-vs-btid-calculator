import { TrendingUp, PiggyBank, Shield } from 'lucide-react';
import { TERM_DURATION_OPTIONS, POST_PREMIUM_STRATEGY_OPTIONS } from '../utils/defaults';

export default function BTIDInputs({ btid, onChange, wlAnnualPremium = 0 }) {
  const handleChange = (field, value) => {
    onChange({ ...btid, [field]: value });
  };

  const premiumDifference = (wlAnnualPremium || 0) - (btid.termCost || 0);

  return (
    <div className="card border-l-4 border-l-btid">
      <h3 className="section-title">
        <TrendingUp className="w-5 h-5 text-btid" />
        Term + Invest Strategy (Scenario B)
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="btidDeathBenefit">
            <Shield className="w-4 h-4 inline mr-1" />
            Death Benefit Coverage
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="btidDeathBenefit"
              className="input-field pl-7"
              value={btid.deathBenefit}
              onChange={(e) => handleChange('deathBenefit', parseInt(e.target.value) || 0)}
              min={1000}
              step={1000}
            />
          </div>
        </div>

        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="termCost">
            Term Premium
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="termCost"
              className="input-field pl-7"
              value={btid.termCost}
              onChange={(e) => handleChange('termCost', parseInt(e.target.value) || 0)}
              min={1}
              step={1}
            />
          </div>
        </div>
        
        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="termDuration">
            Term Duration
          </label>
          <select
            id="termDuration"
            className="input-field"
            value={btid.termDuration}
            onChange={(e) => {
              const val = e.target.value;
              handleChange('termDuration', val.startsWith('retirement') ? val : parseInt(val));
            }}
          >
            {TERM_DURATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="investmentReturn">
            Expected Investment Return
            <span className="text-xs text-gray-500 ml-1">(%/year, net of fees)</span>
          </label>
          <input
            type="number"
            id="investmentReturn"
            className="input-field"
            value={btid.investmentReturnRate}
            onChange={(e) => handleChange('investmentReturnRate', parseFloat(e.target.value) || 0)}
            min={0}
            max={15}
            step={0.5}
          />
        </div>
        
        <div className="input-group min-h-[88px] flex flex-col justify-end">
          <div className="text-sm text-gray-600 mb-1">Annual Investment Amount</div>
          <div className="text-xl font-bold text-btid">
            ${premiumDifference.toLocaleString()}/year
          </div>
          <div className="text-xs text-gray-500">(WL Premium − Term Cost)</div>
        </div>
      </div>
      
      {/* Post-Premium Investment Strategy */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Post-Premium Investment Strategy
        </h4>
        
        <div className="space-y-3">
          {POST_PREMIUM_STRATEGY_OPTIONS.map((option) => (
            <label
              key={option.value}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                btid.postPremiumStrategy === option.value
                  ? 'border-btid bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="postPremiumStrategy"
                value={option.value}
                checked={btid.postPremiumStrategy === option.value}
                onChange={(e) => handleChange('postPremiumStrategy', e.target.value)}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium text-sm text-gray-800">{option.label}</div>
                <div className="text-xs text-gray-500">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
