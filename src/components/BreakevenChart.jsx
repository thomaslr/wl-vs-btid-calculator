import { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { formatCurrency } from '../utils/calculations';

export default function BreakevenChart({ wholeLifeLedger, btidLedger, breakevens, showReal }) {
  const [useLogScale, setUseLogScale] = useState(false);
  
  // Line visibility state
  const [visibleLines, setVisibleLines] = useState({
    wlCashValue: true,
    wlDeathBenefit: true,
    wlTotal: true,
    wlNetValue: false,
    wlNetEstate: false,
    btidInvestment: true,
    btidEstate: true,
    termDeathBenefit: true,
    btidNetValue: false,
    btidNetEstate: false,
  });

  const toggleLine = (lineKey) => {
    setVisibleLines(prev => ({ ...prev, [lineKey]: !prev[lineKey] }));
  };

  if (!wholeLifeLedger || !btidLedger || wholeLifeLedger.length === 0) {
    return null;
  }

  // Prepare chart data
  const chartData = wholeLifeLedger.map((wl, idx) => {
    const btid = btidLedger[idx];
    const wlCashValue = showReal ? wl.cashValueReal : wl.cashValue;
    const wlDeathBenefit = showReal ? wl.deathBenefitReal : wl.deathBenefit;
    const wlPremiumsPaid = showReal ? wl.totalPremiumsPaidReal : wl.totalPremiumsPaid;
    const btidInvestment = showReal ? btid.investmentBalanceReal : btid.investmentBalance;
    const btidEstate = showReal ? btid.totalEstateValueReal : btid.totalEstateValue;
    const btidPremiumsPaid = showReal ? btid.totalPremiumsPaidReal : btid.totalPremiumsPaid;
    const termDeathBenefit = showReal ? btid.termDeathBenefitReal : btid.termDeathBenefit;
    
    return {
      age: wl.age,
      year: wl.year,
      wlCashValue,
      wlDeathBenefit,
      wlTotal: wlCashValue + wlDeathBenefit,
      wlNetValue: wlCashValue - wlPremiumsPaid,
      wlNetEstate: (wlCashValue - wlPremiumsPaid) + wlDeathBenefit,
      btidInvestment,
      btidEstate,
      btidNetValue: btidInvestment - btidPremiumsPaid,
      btidNetEstate: (btidInvestment - btidPremiumsPaid) + termDeathBenefit,
      termDeathBenefit,
      termActive: btid.termActive,
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-2">Age {label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex justify-between gap-4 text-sm">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Find max and min values for Y axis (net values can be negative)
  const allValues = chartData.flatMap(d => [
    d.wlCashValue || 0,
    d.wlDeathBenefit || 0,
    d.wlTotal || 0,
    d.wlNetValue || 0,
    d.wlNetEstate || 0,
    d.btidInvestment || 0,
    d.btidEstate || 0,
    d.btidNetValue || 0,
    d.btidNetEstate || 0,
    d.termDeathBenefit || 0
  ]);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  const formatYAxis = (value) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title mb-0">
          📈 Breakeven Chart
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Y-Scale:</span>
          <button
            onClick={() => setUseLogScale(false)}
            className={`px-3 py-1 text-sm rounded-l-md border ${
              !useLogScale 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Linear
          </button>
          <button
            onClick={() => setUseLogScale(true)}
            className={`px-3 py-1 text-sm rounded-r-md border-t border-r border-b ${
              useLogScale 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Log
          </button>
        </div>
      </div>
      
      {/* Breakeven Indicators */}
      {breakevens && (
        <div className="mb-4 flex flex-wrap gap-3">
          {breakevens.investmentVsCashValue && (
            <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm">
              <span className="text-gray-600">Investment beats Cash Value at </span>
              <span className="font-semibold text-btid-dark">Age {breakevens.investmentVsCashValue.age}</span>
            </div>
          )}
          {breakevens.wlDeathBenefitVsInvestment && (
            <div className="px-3 py-2 bg-green-50 rounded-lg text-sm">
              <span className="text-gray-600">WL Death Benefit beats BTID Estate at </span>
              <span className="font-semibold text-wl-dark">Age {breakevens.wlDeathBenefitVsInvestment.age}</span>
            </div>
          )}
        </div>
      )}
      
      <div className="h-[400px] md:h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="age" 
              label={{ value: 'Age', position: 'bottom', offset: 0 }}
              tick={{ fontSize: 12 }}
              interval={4}
              tickCount={Math.ceil(chartData.length / 5) + 1}
            />
            <YAxis 
              scale={useLogScale ? 'log' : 'linear'}
              domain={useLogScale ? [1000, 'auto'] : [minValue < 0 ? minValue * 1.1 : 0, 'auto']}
              tickFormatter={formatYAxis}
              tick={{ fontSize: 12 }}
              width={80}
              allowDataOverflow={useLogScale}
            />
            {/* Zero reference line for net values (only on linear scale) */}
            {!useLogScale && <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />}
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference line for breakeven */}
            {breakevens?.investmentVsCashValue && (
              <ReferenceLine 
                x={breakevens.investmentVsCashValue.age} 
                stroke="#9333ea" 
                strokeDasharray="5 5"
                label={{ value: 'Crossover', position: 'top', fill: '#9333ea', fontSize: 11 }}
              />
            )}
            
            {/* WL Cash Value - solid */}
            {visibleLines.wlCashValue && (
              <Line
                type="monotone"
                dataKey="wlCashValue"
                name="WL Cash Value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* WL Death Benefit - short dash */}
            {visibleLines.wlDeathBenefit && (
              <Line
                type="monotone"
                dataKey="wlDeathBenefit"
                name="WL Death Benefit"
                stroke="#16a34a"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* WL Total (Cash + Death Benefit) - thick solid */}
            {visibleLines.wlTotal && (
              <Line
                type="monotone"
                dataKey="wlTotal"
                name="WL Total"
                stroke="#15803d"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* BTID Investment - solid */}
            {visibleLines.btidInvestment && (
              <Line
                type="monotone"
                dataKey="btidInvestment"
                name="Investment Account"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* BTID Total Estate - thick solid */}
            {visibleLines.btidEstate && (
              <Line
                type="monotone"
                dataKey="btidEstate"
                name="BTID Estate"
                stroke="#1d4ed8"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* Term Death Benefit - dashed (matching WL Death Benefit) */}
            {visibleLines.termDeathBenefit && (
              <Line
                type="monotone"
                dataKey="termDeathBenefit"
                name="Term Death Benefit"
                stroke="#60a5fa"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* WL Net Value (Cash Value - Premiums Paid) - dotted */}
            {visibleLines.wlNetValue && (
              <Line
                type="monotone"
                dataKey="wlNetValue"
                name="WL Net Value"
                stroke="#86efac"
                strokeWidth={2}
                strokeDasharray="2 4"
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* BTID Net Value (Investment - Premiums Paid) - dotted */}
            {visibleLines.btidNetValue && (
              <Line
                type="monotone"
                dataKey="btidNetValue"
                name="BTID Net Value"
                stroke="#93c5fd"
                strokeWidth={2}
                strokeDasharray="2 4"
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* WL Net Estate (Net Value + Death Benefit) - dash-dot */}
            {visibleLines.wlNetEstate && (
              <Line
                type="monotone"
                dataKey="wlNetEstate"
                name="WL Net Estate"
                stroke="#166534"
                strokeWidth={2}
                strokeDasharray="8 4 2 4"
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
            
            {/* BTID Net Estate (Net Value + Term Death Benefit) - dash-dot */}
            {visibleLines.btidNetEstate && (
              <Line
                type="monotone"
                dataKey="btidNetEstate"
                name="BTID Net Estate"
                stroke="#2563eb"
                strokeWidth={2}
                strokeDasharray="8 4 2 4"
                dot={false}
                activeDot={{ r: 6 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Chart Legend Description - aligned WL vs BTID equivalents with checkboxes */}
      <div className="mt-4 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {/* Header row */}
          <div className="font-semibold text-wl-dark pb-1 border-b border-gray-200">Whole Life (Scenario A)</div>
          <div className="font-semibold text-btid-dark pb-1 border-b border-gray-200">Buy Term & Invest (Scenario B)</div>
          
          {/* Row 1: Liquid Value - solid line */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.wlCashValue} 
              onChange={() => toggleLine('wlCashValue')}
              className="rounded border-gray-300 text-wl focus:ring-wl"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#22c55e" strokeWidth="2" /></svg>
            <span><strong>Cash Value:</strong> Surrender value</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.btidInvestment} 
              onChange={() => toggleLine('btidInvestment')}
              className="rounded border-gray-300 text-btid focus:ring-btid"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#3b82f6" strokeWidth="2" /></svg>
            <span><strong>Investment:</strong> Liquid balance</span>
          </label>
          
          {/* Row 2: Death Benefit - dashed line */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.wlDeathBenefit} 
              onChange={() => toggleLine('wlDeathBenefit')}
              className="rounded border-gray-300 text-wl focus:ring-wl"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#16a34a" strokeWidth="2" strokeDasharray="8 4" /></svg>
            <span><strong>Death Benefit:</strong> Payout on death</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.termDeathBenefit} 
              onChange={() => toggleLine('termDeathBenefit')}
              className="rounded border-gray-300 text-btid focus:ring-btid"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#60a5fa" strokeWidth="2" strokeDasharray="8 4" /></svg>
            <span><strong>Term Death Benefit:</strong> Drops to $0 when expired</span>
          </label>
          
          {/* Row 3: Total Estate - thick solid line */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.wlTotal} 
              onChange={() => toggleLine('wlTotal')}
              className="rounded border-gray-300 text-wl focus:ring-wl"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#15803d" strokeWidth="3" /></svg>
            <span><strong>Total Estate:</strong> Cash + Death Benefit</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.btidEstate} 
              onChange={() => toggleLine('btidEstate')}
              className="rounded border-gray-300 text-btid focus:ring-btid"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#1d4ed8" strokeWidth="3" /></svg>
            <span><strong>Total Estate:</strong> Investment + Term DB</span>
          </label>
          
          {/* Row 4: Net Value - dotted line */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.wlNetValue} 
              onChange={() => toggleLine('wlNetValue')}
              className="rounded border-gray-300 text-wl focus:ring-wl"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#86efac" strokeWidth="2" strokeDasharray="2 4" /></svg>
            <span><strong>Net Value:</strong> Cash − Premiums Paid</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.btidNetValue} 
              onChange={() => toggleLine('btidNetValue')}
              className="rounded border-gray-300 text-btid focus:ring-btid"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#93c5fd" strokeWidth="2" strokeDasharray="2 4" /></svg>
            <span><strong>Net Value:</strong> Investment − Premiums Paid</span>
          </label>
          
          {/* Row 5: Net Estate - dash-dot line */}
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.wlNetEstate} 
              onChange={() => toggleLine('wlNetEstate')}
              className="rounded border-gray-300 text-wl focus:ring-wl"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#166534" strokeWidth="2" strokeDasharray="8 4 2 4" /></svg>
            <span><strong>Net Estate:</strong> Net Value + Death Benefit</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1">
            <input 
              type="checkbox" 
              checked={visibleLines.btidNetEstate} 
              onChange={() => toggleLine('btidNetEstate')}
              className="rounded border-gray-300 text-btid focus:ring-btid"
            />
            <svg width="32" height="8"><line x1="0" y1="4" x2="32" y2="4" stroke="#2563eb" strokeWidth="2" strokeDasharray="8 4 2 4" /></svg>
            <span><strong>Net Estate:</strong> Net Value + Term DB</span>
          </label>
        </div>
      </div>
      
      {/* Net Value Explanation */}
      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <strong>Net Value lines</strong> show your actual profit/loss: the value you'd receive if you cashed out today, 
        minus what you've paid in premiums. Negative = you're behind; Positive = you're ahead. 
        The point where the line crosses $0 is your breakeven on premiums paid.
      </div>
    </div>
  );
}
