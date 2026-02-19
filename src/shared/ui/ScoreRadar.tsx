interface ScoreRadarProps {
  values: number[];
  labels: string[];
}

const toPoints = (values: number[], size: number): string => {
  const center = size / 2;
  const radius = size * 0.4;

  return values
    .map((value, index) => {
      const ratio = Math.max(0, Math.min(100, value)) / 100;
      const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
      const x = center + Math.cos(angle) * radius * ratio;
      const y = center + Math.sin(angle) * radius * ratio;
      return `${x},${y}`;
    })
    .join(" ");
};

export const ScoreRadar = ({ values, labels }: ScoreRadarProps): JSX.Element => {
  const safeValues = values.length === 5 ? values : [0, 0, 0, 0, 0];
  const safeLabels = labels.length === 5 ? labels : ["-", "-", "-", "-", "-"];
  const size = 280;

  return (
    <div className="radar-wrapper">
      <svg viewBox={`0 0 ${size} ${size}`} className="radar-chart" role="img" aria-label="項目別スコア">
        <polygon points={toPoints([100, 100, 100, 100, 100], size)} className="radar-grid" />
        <polygon points={toPoints(safeValues, size)} className="radar-fill" />
      </svg>
      <ul className="radar-labels">
        {safeLabels.map((label, index) => (
          <li key={`${label}-${index}`}>{label}: {safeValues[index]}</li>
        ))}
      </ul>
    </div>
  );
};
