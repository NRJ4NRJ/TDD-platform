type RadarCategory = {
  id: string;
  label: string;
  score: number | null;
};

function polarPoint(center: number, radius: number, index: number, total: number) {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: center + Math.cos(angle) * radius,
    y: center + Math.sin(angle) * radius,
  };
}

export default function RiskRadarChart({
  categories,
}: {
  categories: RadarCategory[];
}) {
  const size = 360;
  const center = size / 2;
  const radius = 108;
  const labelRadius = 142;
  const total = categories.length;
  const scorePoints = categories
    .map((category, index) => {
      if (category.score === null) {
        return null;
      }
      return polarPoint(center, (radius * category.score) / 5, index, total);
    })
    .filter((point): point is { x: number; y: number } => point !== null);
  const scorePolygonPoints = scorePoints
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const gridPolygons = [1, 2, 3, 4, 5].map((level) =>
    categories
      .map((_, index) => {
        const point = polarPoint(center, (radius * level) / 5, index, total);
        return `${point.x},${point.y}`;
      })
      .join(" ")
  );

  return (
    <div className="mx-auto w-full max-w-[480px]">
      <div className="relative mx-auto aspect-square w-full max-w-[420px]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label="Graphe en araignée des scores de risque par catégorie"
          className="h-full w-full"
        >
          <title>Scores moyens de risque par catégorie</title>
          {gridPolygons.map((points, index) => (
            <polygon
              key={index}
              points={points}
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}

          {categories.map((category, index) => {
            const axisEnd = polarPoint(center, radius, index, total);
            const labelPoint = polarPoint(center, labelRadius, index, total);
            const anchor =
              Math.abs(labelPoint.x - center) < 12
                ? "middle"
                : labelPoint.x > center
                  ? "start"
                  : "end";

            return (
              <g key={category.id}>
                <line
                  x1={center}
                  y1={center}
                  x2={axisEnd.x}
                  y2={axisEnd.y}
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  textAnchor={anchor}
                  dominantBaseline="middle"
                  className="fill-slate-600 text-[10px] font-medium"
                >
                  {category.label}
                </text>
              </g>
            );
          })}

          {scorePoints.length >= 3 && (
            <polygon
              points={scorePolygonPoints}
              fill="#2563eb"
              fillOpacity="0.18"
              stroke="#2563eb"
              strokeWidth="2"
            />
          )}

          {categories.map((category, index) => {
            if (category.score === null) {
              return null;
            }
            const point = polarPoint(center, (radius * category.score) / 5, index, total);
            return (
              <g key={`${category.id}-score`}>
                {scorePoints.length < 3 && (
                  <line
                    x1={center}
                    y1={center}
                    x2={point.x}
                    y2={point.y}
                    stroke="#2563eb"
                    strokeOpacity="0.5"
                    strokeWidth="3"
                  />
                )}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="#2563eb"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>
      </div>
      {scorePoints.length === 0 && (
        <p className="text-center text-sm text-slate-400">
          Aucune sous-catégorie évaluée pour le moment.
        </p>
      )}
    </div>
  );
}
