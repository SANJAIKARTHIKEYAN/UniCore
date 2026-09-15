import React from 'react';

/**
 * CyberWaveChart — Pure SVG Glowing Wave Spline Chart
 * Recreates the smooth cyan neon spline wave area chart seen in the UniCore Sci-Fi HUD reference.
 */
export default function CyberWaveChart({
  data = [45, 52, 68, 62, 85, 78, 88, 92],
  labels = ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov', 'Dec'],
  strokeColor = '#00f0ff',
  fillGradientId = 'cyberCyanWaveGrad',
  height = 140,
  minVal = 0,
  maxVal = 100,
  showDots = true,
}) {
  const width = 360;
  const padding = { top: 15, bottom: 25, left: 25, right: 15 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Normalize data items to numeric values and labels
  const numericValues = data.map((item) => (typeof item === 'number' ? item : item?.value ?? 0));
  const effectiveLabels = data[0]?.label ? data.map((item) => item.label) : labels;

  // Map data to SVG coordinates
  const points = numericValues.map((val, idx) => {
    const x = padding.left + (idx / Math.max(1, numericValues.length - 1)) * chartW;
    const norm = Math.max(0, Math.min(1, (val - minVal) / Math.max(1, maxVal - minVal)));
    const y = padding.top + chartH - norm * chartH;
    return { x, y, val };
  });


  // Generate smooth cubic bezier spline curve
  const createSplinePath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[0];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return path;
  };

  const linePath = createSplinePath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`
    : '';

  // Peak index for glowing focus dot
  const maxIdx = data.reduce((maxI, curr, i, arr) => curr > arr[maxI] ? i : maxI, 0);

  return (
    <div className="cyber-chart-wrapper" style={{ width: '100%', overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.35" />
            <stop offset="60%" stopColor={strokeColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.00" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((level) => {
          const y = padding.top + chartH - (level / 100) * chartH;
          return (
            <g key={level}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="3 3"
              />
              {level % 50 === 0 && (
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  fill="rgba(148, 163, 184, 0.5)"
                  fontSize="8"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {level}
                </text>
              )}
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${fillGradientId})`} />

        {/* Glowing spline line */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          filter="url(#neonGlow)"
          strokeLinecap="round"
        />

        {/* Highlight nodes */}
        {showDots &&
          points.map((pt, i) => {
            const isPeak = i === maxIdx;
            return (
              <g key={i}>
                {isPeak && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="7"
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="1.5"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      values="5;9;5"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.8;0.2;0.8"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isPeak ? "3.5" : "2"}
                  fill={isPeak ? "#ffffff" : strokeColor}
                  stroke={strokeColor}
                  strokeWidth="1"
                />
              </g>
            );
          })}

        {/* X-axis labels */}
        {effectiveLabels.map((lbl, idx) => {
          const x = padding.left + (idx / Math.max(1, effectiveLabels.length - 1)) * chartW;
          return (
            <text
              key={lbl + idx}
              x={x}
              y={height - 6}
              fill="rgba(148, 163, 184, 0.6)"
              fontSize="8"
              textAnchor="middle"
              fontFamily="monospace"
            >
              {lbl}
            </text>
          );
        })}

      </svg>
    </div>
  );
}
