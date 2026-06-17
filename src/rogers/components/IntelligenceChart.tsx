import React from "react";
import { IntelligenceDetail, intelligences } from "../data/intelligenceData";

interface IntelligenceChartProps {
  scores: Record<string, number>;
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const IntelligenceChart: React.FC<IntelligenceChartProps> = ({
  scores,
  activeId,
  onSelect,
}) => {
  // Polar coordinate helper for radar/spider chart
  // Center is (150, 150), radius is 100
  const center = 150;
  const radius = 100;
  const totalAxes = intelligences.length;

  const getCoordinates = (index: number, value: number) => {
    // Value represents the score from 7 to 35. Let's map 0 to 35 onto 0 to radius.
    const normalizedValue = Math.max(0, Math.min(35, value));
    const distance = (normalizedValue / 35) * radius;
    // Angle in radians (shifted by -90 deg to start from the top)
    const angle = (index * 2 * Math.PI) / totalAxes - Math.PI / 2;
    const x = center + distance * Math.cos(angle);
    const y = center + distance * Math.sin(angle);
    return { x, y };
  };

  // Generate background regular octagon webs (for scores 7, 14, 21, 28, 35)
  const webLevels = [7, 14, 21, 28, 35];
  const webPaths = webLevels.map((level) => {
    const points = Array.from({ length: totalAxes }).map((_, i) => {
      const { x, y } = getCoordinates(i, level);
      return `${x},${y}`;
    });
    return points.join(" ") + " z";
  });

  // Generate actual user score polygon path
  const userPoints = intelligences.map((meta, i) => {
    const score = scores[meta.id] || 0;
    const { x, y } = getCoordinates(i, score);
    return `${x},${y}`;
  });
  const userPolygonPath = userPoints.join(" ") + " z";

  // Generate axes lines and labels
  const axes = intelligences.map((meta, i) => {
    const score = scores[meta.id] || 0;
    const outerCoord = getCoordinates(i, 35);
    const textCoord = getCoordinates(i, 42); // Slightly outside for labeling
    const userCoord = getCoordinates(i, score);
    
    return {
      id: meta.id,
      name: meta.name,
      outer: outerCoord,
      text: textCoord,
      user: userCoord,
      score,
      englishName: meta.englishName,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-[320px] aspect-square rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="w-full h-full select-none overflow-visible">
          {/* Defs for glossy radial grid background or shadow */}
          <defs>
            <radialGradient id="meshGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="100%" stopColor="#f8fafc" stopOpacity="0.8" />
            </radialGradient>
            <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="1" dy="2" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>

          {/* Web mesh ring level backgrounds */}
          {webPaths.map((pathStr, idx) => (
            <polygon
              key={idx}
              points={pathStr}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="0.75"
              strokeDasharray={idx < 4 ? "2,2" : "none"}
            />
          ))}

          {/* Helper circular guidelines */}
          <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="1" />
          <circle cx={center} cy={center} r={radius * 0.6} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
          <circle cx={center} cy={center} r={radius * 0.2} fill="none" stroke="#e2e8f0" strokeWidth="0.5" />

          {/* Custom Web Lines */}
          {axes.map((axis, i) => (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={axis.outer.x}
              y2={axis.outer.y}
              stroke="#94a3b8"
              strokeWidth="0.75"
              className="opacity-40"
            />
          ))}

          {/* Filled User Polygon */}
          <polygon
            points={userPolygonPath}
            fill="rgba(79, 70, 229, 0.18)"
            stroke="#4f46e5"
            strokeWidth="2.5"
            className="transition-all duration-500 ease-in-out cursor-pointer"
            filter="url(#shadowFilter)"
            onClick={() => onSelect(activeId || intelligences[0].id)}
          />

          {/* Interactive node indicators and axis selectors */}
          {axes.map((axis, i) => {
            const isActive = activeId === axis.id;
            return (
              <g 
                key={axis.id} 
                onClick={() => onSelect(axis.id)} 
                className="cursor-pointer group"
              >
                {/* Node connection line highlighting on hover */}
                {isActive && (
                  <circle
                    cx={axis.user.x}
                    cy={axis.user.y}
                    r="12"
                    fill="rgba(79, 70, 229, 0.15)"
                    className="animate-ping"
                  />
                )}

                {/* Actual node dot */}
                <circle
                  cx={axis.user.x}
                  cy={axis.user.y}
                  r={isActive ? "6" : "4.5"}
                  fill={isActive ? "#4f46e5" : "#6366f1"}
                  stroke="#ffffff"
                  strokeWidth={isActive ? "2" : "1.5"}
                  className="transition-all duration-300 drop-shadow-sm group-hover:r-[7px]"
                />

                {/* Outer interactive hover ring */}
                <circle
                  cx={axis.user.x}
                  cy={axis.user.y}
                  r="14"
                  fill="transparent"
                />

                {/* Labels */}
                <text
                  x={axis.text.x}
                  y={axis.text.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className={`text-[9px] font-semibold transition-all duration-300 select-none ${
                    isActive
                      ? "fill-indigo-700 font-extrabold text-[12px]"
                      : "fill-neutral-600 group-hover:fill-slate-900 group-hover:font-medium"
                  }`}
                  dir="rtl"
                >
                  {axis.name}
                </text>

                {/* Tiny score badge on node hover */}
                <text
                  x={axis.user.x}
                  y={axis.user.y - 12}
                  textAnchor="middle"
                  className="text-[9px] font-sans font-extrabold fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity bg-white pointer-events-none"
                >
                  {axis.score}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Guide/Legend */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 w-full max-w-sm text-xs justify-items-center">
        {intelligences.map((meta, i) => {
          const score = scores[meta.id] || 0;
          const isActive = activeId === meta.id;
          return (
            <button
              key={meta.id}
              onClick={() => onSelect(meta.id)}
              className={`flex items-center space-x-2 space-x-reverse text-right transition-all px-2.5 py-1.5 rounded-lg w-full ${
                isActive 
                  ? "bg-indigo-50 text-indigo-800 font-bold border border-indigo-200"
                  : "hover:bg-slate-50 text-neutral-600 border border-transparent"
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 flex-shrink-0" />
              <span className="flex-1 truncate">{meta.name}</span>
              <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">{score}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
