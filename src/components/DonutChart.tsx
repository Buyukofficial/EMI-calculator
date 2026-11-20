import React from 'react';

interface DonutChartProps {
  loanPercent: number; // e.g. 70.08
  interestPercent: number; // e.g. 29.92
}

export const DonutChart: React.FC<DonutChartProps> = ({ loanPercent, interestPercent }) => {
  const radius = 60;
  const strokeWidth = 34;
  const circumference = 2 * Math.PI * radius; // ~376.99

  const safeLoanPct = isNaN(loanPercent) || loanPercent < 0 ? 0 : Math.min(100, loanPercent);
  const safeInterestPct = isNaN(interestPercent) || interestPercent < 0 ? 0 : Math.min(100, interestPercent);

  // Dash lengths
  const loanDash = (safeLoanPct / 100) * circumference;
  const interestDash = (safeInterestPct / 100) * circumference;

  // Mid-angles in degrees (-90deg offset so 0° is top)
  const loanMidAngle = (safeLoanPct / 2 / 100) * 360 - 90;
  const interestMidAngle = (safeLoanPct / 100 + safeInterestPct / 2 / 100) * 360 - 90;

  // Convert polar to cartesian
  const toCoords = (deg: number, r: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: 100 + r * Math.cos(rad),
      y: 100 + r * Math.sin(rad)
    };
  };

  const loanLabelPos = toCoords(loanMidAngle, radius);
  const interestLabelPos = toCoords(interestMidAngle, radius);

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-2xs flex flex-col items-center">
      {/* SVG Donut */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {/* Neutral base ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#F1F5F9"
            strokeWidth={strokeWidth}
          />

          {/* Loan Amount Slice - Apple Orange #FF9500 */}
          {safeLoanPct > 0 && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#FF9500"
              strokeWidth={strokeWidth}
              strokeDasharray={`${loanDash} ${circumference}`}
              strokeDashoffset="0"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* Interest Slice - Apple Green #34C759 */}
          {safeInterestPct > 0 && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#34C759"
              strokeWidth={strokeWidth}
              strokeDasharray={`${interestDash} ${circumference}`}
              strokeDashoffset={`-${loanDash}`}
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Text percentage overlays inside the slices */}
        <div className="absolute inset-0 pointer-events-none">
          {safeInterestPct >= 8 && (
            <div
              style={{
                position: 'absolute',
                left: `${(interestLabelPos.x / 200) * 100}%`,
                top: `${(interestLabelPos.y / 200) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="text-[12px] font-extrabold text-white drop-shadow-xs font-mono-numbers tracking-tight"
            >
              {safeInterestPct.toFixed(2)}%
            </div>
          )}

          {safeLoanPct >= 8 && (
            <div
              style={{
                position: 'absolute',
                left: `${(loanLabelPos.x / 200) * 100}%`,
                top: `${(loanLabelPos.y / 200) * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
              className="text-[12px] font-extrabold text-white drop-shadow-xs font-mono-numbers tracking-tight"
            >
              {safeLoanPct.toFixed(2)}%
            </div>
          )}
        </div>

        {/* Center Cutout text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Breakdown</span>
          <span className="text-[13px] font-bold text-slate-700">Principal / Interest</span>
        </div>
      </div>

      {/* Legend with matching badges */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
          <span className="w-2.5 h-2.5 rounded-full bg-[#34C759] inline-block shadow-xs"></span>
          <span>Interest ({safeInterestPct.toFixed(1)}%)</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF9500] inline-block shadow-xs"></span>
          <span>Loan ({safeLoanPct.toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  );
};
export default DonutChart;
