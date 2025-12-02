import { formatCurrency } from '../utils/calculations';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export default function ComparisonTable({ summary, showReal }) {
  if (!summary || summary.length === 0) return null;

  const getDifference = (wlValue, btidValue) => {
    const diff = btidValue - wlValue;
    const percentage = wlValue !== 0 ? (diff / wlValue) * 100 : 0;
    return { diff, percentage };
  };

  const DiffIndicator = ({ diff, percentage }) => {
    if (Math.abs(percentage) < 1) {
      return (
        <span className="flex items-center gap-1 text-gray-500 text-xs">
          <Minus className="w-3 h-3" />
          Similar
        </span>
      );
    }
    if (diff > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-xs">
          <ArrowUpRight className="w-3 h-3" />
          +{formatCurrency(diff, true)} ({percentage.toFixed(0)}%)
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-red-600 text-xs">
        <ArrowDownRight className="w-3 h-3" />
        {formatCurrency(diff, true)} ({percentage.toFixed(0)}%)
      </span>
    );
  };

  return (
    <div className="card overflow-x-auto">
      <h3 className="section-title mb-4">
        📊 Key Age Snapshots
      </h3>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-2 font-semibold text-gray-700">Age</th>
            <th className="text-center py-3 px-2 font-semibold text-gray-700" colSpan={2}>
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-wl"></span>
                Whole Life
              </div>
            </th>
            <th className="text-center py-3 px-2 font-semibold text-gray-700" colSpan={2}>
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-btid"></span>
                BTID
              </div>
            </th>
            <th className="text-right py-3 px-2 font-semibold text-gray-700">Difference</th>
          </tr>
          <tr className="border-b border-gray-100 text-xs text-gray-500">
            <th className="py-2 px-2"></th>
            <th className="py-2 px-2 text-center">Liquidity</th>
            <th className="py-2 px-2 text-center">Estate</th>
            <th className="py-2 px-2 text-center">Liquidity</th>
            <th className="py-2 px-2 text-center">Estate</th>
            <th className="py-2 px-2 text-right">(BTID vs WL)</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((row, idx) => {
            const wlLiquidity = showReal ? row.wl.liquidityReal : row.wl.liquidity;
            const wlEstate = showReal ? row.wl.estateValueReal : row.wl.estateValue;
            const btidLiquidity = showReal ? row.btid.liquidityReal : row.btid.liquidity;
            const btidEstate = showReal ? row.btid.estateValueReal : row.btid.estateValue;
            
            const liquidityDiff = getDifference(wlLiquidity, btidLiquidity);
            const estateDiff = getDifference(wlEstate, btidEstate);
            
            return (
              <tr 
                key={row.age}
                className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}
              >
                <td className="py-4 px-2">
                  <span className="font-semibold text-gray-800">Age {row.age}</span>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-wl-dark">
                    {formatCurrency(wlLiquidity, true)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Cash Value
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-wl-dark">
                    {formatCurrency(wlEstate, true)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Death Benefit
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-btid-dark">
                    {formatCurrency(btidLiquidity, true)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Investments
                  </div>
                </td>
                <td className="py-4 px-2 text-center">
                  <div className="font-medium text-btid-dark">
                    {formatCurrency(btidEstate, true)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Invest + Term
                  </div>
                </td>
                <td className="py-4 px-2 text-right">
                  <div className="space-y-1">
                    <div>
                      <span className="text-xs text-gray-500">Liquidity: </span>
                      <DiffIndicator {...liquidityDiff} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Estate: </span>
                      <DiffIndicator {...estateDiff} />
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Premium Summary */}
      {summary.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">WL Total Premiums (at Age {summary[summary.length - 1]?.age})</div>
              <div className="font-semibold text-wl-dark">
                {formatCurrency(showReal ? summary[summary.length - 1]?.wl.totalPremiumsReal : summary[summary.length - 1]?.wl.totalPremiums)}
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">Term Total Premiums (at Age {summary[summary.length - 1]?.age})</div>
              <div className="font-semibold text-btid-dark">
                {formatCurrency(showReal ? summary[summary.length - 1]?.btid.totalPremiumsReal : summary[summary.length - 1]?.btid.totalPremiums)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
