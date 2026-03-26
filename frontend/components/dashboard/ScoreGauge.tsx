"use client";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

function getGaugeColor(score: number): string {
  if (score <= 15) return "#22c55e"; // green
  if (score <= 40) return "#3b82f6"; // blue
  if (score <= 70) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

function getLabel(score: number): string {
  if (score <= 15) return "Safe";
  if (score <= 40) return "Ready";
  if (score <= 70) return "At Risk";
  return "Vulnerable";
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number): string {
  const startX = cx + radius * Math.cos(startAngle);
  const startY = cy + radius * Math.sin(startAngle);
  const endX = cx + radius * Math.cos(endAngle);
  const endY = cy + radius * Math.sin(endAngle);

  const largeArc = Math.abs(startAngle - endAngle) > Math.PI ? 1 : 0;

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`;
}

export function ScoreGauge({ score, size = "md" }: ScoreGaugeProps) {
  const color = getGaugeColor(score);
  const label = getLabel(score);

  // SVG dimensions based on size
  const dimensions = {
    sm: { width: 120, height: 75, fontSize: 20, labelSize: 10 },
    md: { width: 180, height: 110, fontSize: 32, labelSize: 12 },
    lg: { width: 240, height: 145, fontSize: 42, labelSize: 14 },
  };

  const d = dimensions[size];
  const cx = d.width / 2;
  const cy = d.height - 10;
  const radius = d.width / 2 - 15;

  // Arc path for the background (semicircle)
  const startAngle = Math.PI;
  const endAngle = 0;
  const bgArc = describeArc(cx, cy, radius, startAngle, endAngle);

  // Score arc (proportional to score/100)
  const scoreAngle = Math.PI - (score / 100) * Math.PI;
  const scoreArc = describeArc(cx, cy, radius, Math.PI, scoreAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width={d.width} height={d.height} viewBox={`0 0 ${d.width} ${d.height}`}>
        {/* Background arc */}
        <path d={bgArc} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" strokeLinecap="round" />

        {/* Score arc */}
        <path d={scoreArc} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" />

        {/* Score text */}
        <text x={cx} y={cy - 15} textAnchor="middle" fontSize={d.fontSize} fontWeight="bold" fill={color}>
          {score}
        </text>

        {/* Label */}
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize={d.labelSize} fill="currentColor" className="text-muted-foreground">
          {label}
        </text>
      </svg>
    </div>
  );
}
