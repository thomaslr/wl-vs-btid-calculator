import { User, Calendar, TrendingUp, Shield } from 'lucide-react';

export default function ProfileInputs({ profile, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <div className="card">
      <h3 className="section-title">
        <User className="w-5 h-5 text-primary-600" />
        Profile (Singapore Context)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="currentAge">
            Current Age
          </label>
          <input
            type="number"
            id="currentAge"
            className="input-field"
            value={profile.currentAge}
            onChange={(e) => handleChange('currentAge', parseInt(e.target.value) || 0)}
            min={18}
            max={70}
          />
        </div>
        
        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="retirementAge">
            Retirement/Target Age
          </label>
          <input
            type="number"
            id="retirementAge"
            className="input-field"
            value={profile.retirementAge}
            onChange={(e) => handleChange('retirementAge', parseInt(e.target.value) || 0)}
            min={45}
            max={80}
          />
        </div>
        
        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="lifeExpectancy">
            Life Expectancy
            <span className="text-xs text-gray-500 ml-1">(for Estate Value)</span>
          </label>
          <input
            type="number"
            id="lifeExpectancy"
            className="input-field"
            value={profile.lifeExpectancy}
            onChange={(e) => handleChange('lifeExpectancy', parseInt(e.target.value) || 0)}
            min={70}
            max={100}
          />
        </div>
        
        <div className="input-group min-h-[88px]">
          <label className="input-label" htmlFor="inflationRate">
            Inflation Rate Assumption
            <span className="text-xs text-gray-500 ml-1">(%)</span>
          </label>
          <input
            type="number"
            id="inflationRate"
            className="input-field"
            value={profile.inflationRate}
            onChange={(e) => handleChange('inflationRate', parseFloat(e.target.value) || 0)}
            min={0}
            max={10}
            step={0.1}
          />
        </div>
      </div>
    </div>
  );
}
