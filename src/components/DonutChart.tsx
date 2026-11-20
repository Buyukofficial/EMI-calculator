import React from 'react';

interface DonutChartProps {
  loanPercent: number; // e.g. 70.08
  interestPercent: number; // e.g. 29.92
}

export const DonutChart: React.FC<DonutChartProps> = ({ loanPercent, interestPercent }) => {
  const radius = 58;
  const strokeWidth = 36;
  const circumference = 2 * Math.PI * radius; // ~364.42

  const safeLoanPct = isNaN(loanPercent) || loanPercent < 0 ? 0 : Math.min(100, loanPercent);
  const safeInterestPct = isNaN(interestPercent) || interestPercent < 0 ? 0 : Math.min(100, interestPercent);

  // Dash lengths
  const loanDash = (safeLoanPct / 100) * circumference;
  const interestDash = (safeInterestPct / 100) * circumference;

  // Mid-angle for text labels (in degrees)
  const loanMidAngle = (safeLoanPct / 2 / 100) * 360 - 90;
  const interestMidAngle = (safeLoanPct / 100 + safeInterestPct / 2 / 100) * 360 - 90;

  // Convert polar to cartesian
  const toCoords = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: 100 + radius * Math.cos(rad),
      y: 100 + radius * Math.sin(rad)
    };
  };

  const loanLabelPos = toCoords(loanMidAngle);
  const interestLabelPos = toCoords(interestMidAngle);

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-slate-100 shadow-2xs flex flex-col items-center w-full">
      {/* SVG Donut */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
          {/* Background circle if 0 */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Orange Loan Amount Slice */}
          {safeLoanPct > 0 && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#f59e0b" // Orange
              strokeWidth={strokeWidth}
              strokeDasharray={`${loanDash} ${circumference}`}
              strokeDashoffset="0"
              className="transition-all duration-500 ease-out"
            />
          )}

          {/* Green Interest Slice */}
          {safeInterestPct > 0 && (
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="#22c55e" // Green
              strokeWidth={strokeWidth}
              strokeDasharray={`${interestDash} ${circumference}`}
              strokeDashoffset={`-${loanDash}`}
              className="transition-all duration-500 ease-out"
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
              className="text-[11px] font-extrabold text-white drop-shadow-xs font-mono-numbers"
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
              className="text-[11px] font-extrabold text-white drop-shadow-xs font-mono-numbers"
            >
              {safeLoanPct.toFixed(2)}%
            </div>
          )}
        </div>
      </div>

      {/* Legend - exactly matching screenshot */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block"></span>
          <span>Interest</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block"></span>
          <span>Loan Amount</span>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
