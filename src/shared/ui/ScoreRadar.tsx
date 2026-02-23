import { useEffect, useMemo, useRef, useState } from "react";

interface ScoreRadarProps {
  values: number[];
  labels: string[];
}

const TOTAL = 5;
const ANIM_DURATION = 1400; // ms

/** 0–1 の ratio と頂点インデックスから SVG座標を算出 */
const getVertex = (ratio: number, index: number, cx: number, cy: number, r: number) => {
  const angle = (Math.PI * 2 * index) / TOTAL - Math.PI / 2;
  const clampedRatio = Math.max(0, Math.min(1, ratio));
  return {
    x: cx + Math.cos(angle) * r * clampedRatio,
    y: cy + Math.sin(angle) * r * clampedRatio,
  };
};

/** グリッド多角形のポイント文字列を生成 */
const gridPoints = (scale: number, cx: number, cy: number, r: number): string =>
  Array.from({ length: TOTAL }, (_, i) => {
    const angle = (Math.PI * 2 * i) / TOTAL - Math.PI / 2;
    return `${cx + Math.cos(angle) * r * scale},${cy + Math.sin(angle) * r * scale}`;
  }).join(" ");

/** データ多角形のポイント文字列を生成 */
const dataPoints = (ratios: number[], cx: number, cy: number, r: number): string =>
  ratios
    .map((ratio, i) => {
      const pt = getVertex(ratio, i, cx, cy, r);
      return `${pt.x},${pt.y}`;
    })
    .join(" ");

/** イーズアウト (quart) */
const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);

export const ScoreRadar = ({ values, labels }: ScoreRadarProps): JSX.Element => {
  const safeValues = values.length === 5 ? values : [0, 0, 0, 0, 0];
  const safeLabels = labels.length === 5 ? labels : ["-", "-", "-", "-", "-"];

  // ---- アニメーション ----
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  useEffect(() => {
    startRef.current = 0;
    setProgress(0);

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(1, elapsed / ANIM_DURATION);
      setProgress(easeOutQuart(p));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- 最大値の頂点インデックス ----
  const maxIndex = useMemo(() => {
    let maxVal = -Infinity;
    let maxIdx = 0;
    safeValues.forEach((v, i) => {
      if (v > maxVal) {
        maxVal = v;
        maxIdx = i;
      }
    });
    return maxIdx;
  }, [safeValues]);

  // アニメーション進捗を掛けた表示用 ratio 配列
  const displayRatios = safeValues.map((v) => (v / 100) * progress);
  const showGlow = progress > 0.88;

  // SVG サイズ定数
  const SIZE = 290;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = SIZE * 0.355;
  const LABEL_R = R * 1.3;

  // 最大値頂点の座標 (アニメーション完了後の実座標)
  const maxPt = getVertex(safeValues[maxIndex] / 100, maxIndex, CX, CY, R);

  return (
    <div className="radar-wrapper">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="radar-chart"
        role="img"
        aria-label="項目別スコア"
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* レーダー塗りグラデーション */}
          <radialGradient id="svRadarFill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#00d8ff" stopOpacity="0.38" />
            <stop offset="55%"  stopColor="#4a1d90" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#030508" stopOpacity="0.08" />
          </radialGradient>

          {/* ソフトグロー */}
          <filter id="svGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 強グロー (最大頂点用) */}
          <filter id="svStrongGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ----- グリッド多角形 (20% 刻み) ----- */}
        {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
          <polygon
            key={scale}
            points={gridPoints(scale, CX, CY, R)}
            fill="none"
            stroke={scale === 1.0 ? "rgba(110, 130, 220, 0.55)" : "rgba(55, 75, 160, 0.32)"}
            strokeWidth={scale === 1.0 ? 1.2 : 0.7}
          />
        ))}

        {/* ----- 軸ライン ----- */}
        {Array.from({ length: TOTAL }, (_, i) => {
          const angle = (Math.PI * 2 * i) / TOTAL - Math.PI / 2;
          const ox = CX + Math.cos(angle) * R;
          const oy = CY + Math.sin(angle) * R;
          return (
            <line
              key={i}
              x1={CX} y1={CY}
              x2={ox} y2={oy}
              stroke="rgba(55, 75, 160, 0.38)"
              strokeWidth="0.7"
            />
          );
        })}

        {/* ----- データ: 塗り ----- */}
        <polygon
          points={dataPoints(displayRatios, CX, CY, R)}
          fill="url(#svRadarFill)"
          filter="url(#svGlow)"
        />

        {/* ----- データ: 外枠線 ----- */}
        <polygon
          points={dataPoints(displayRatios, CX, CY, R)}
          fill="none"
          stroke="#00d8ff"
          strokeWidth="1.6"
          filter="url(#svGlow)"
        />

        {/* ----- 最大頂点: リップルリング ----- */}
        {showGlow && (
          <>
            <circle
              cx={maxPt.x} cy={maxPt.y} r={9}
              fill="none"
              stroke="#ffd700"
              strokeWidth="1.5"
              opacity="0.85"
              className="sv-ripple sv-ripple-1"
            />
            <circle
              cx={maxPt.x} cy={maxPt.y} r={9}
              fill="none"
              stroke="#ffd700"
              strokeWidth="1"
              opacity="0.6"
              className="sv-ripple sv-ripple-2"
            />
          </>
        )}

        {/* ----- 頂点ドット ----- */}
        {displayRatios.map((ratio, i) => {
          const pt = getVertex(ratio, i, CX, CY, R);
          const isMax = i === maxIndex && showGlow;
          return (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={isMax ? 6 : 3.5}
              fill={isMax ? "#ffd700" : "#00d8ff"}
              stroke={isMax ? "rgba(255,255,255,0.6)" : "#00a8cc"}
              strokeWidth="1"
              filter={isMax ? "url(#svStrongGlow)" : "url(#svGlow)"}
              className={isMax ? "sv-max-dot" : undefined}
            />
          );
        })}

        {/* ----- ラベル ----- */}
        {safeLabels.map((label, i) => {
          const angle = (Math.PI * 2 * i) / TOTAL - Math.PI / 2;
          const lx = CX + Math.cos(angle) * LABEL_R;
          const ly = CY + Math.sin(angle) * LABEL_R;
          const isMax = i === maxIndex;
          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isMax && showGlow ? "#f5c84a" : "rgba(140, 140, 200, 0.9)"}
              fontSize="10"
              fontFamily="'Cinzel', 'Hiragino Kaku Gothic ProN', serif"
              fontWeight={isMax && showGlow ? "700" : "600"}
              style={{
                textShadow: isMax && showGlow
                  ? "0 0 8px rgba(245, 200, 74, 0.7)"
                  : undefined,
              }}
            >
              {label}
            </text>
          );
        })}
      </svg>

      {/* スコア一覧 */}
      <ul className="radar-labels">
        {safeLabels.map((label, i) => (
          <li key={`${label}-${i}`} style={{ color: i === maxIndex ? "var(--sv-gold-bright)" : undefined }}>
            {label}: <strong style={{ color: i === maxIndex ? "var(--sv-gold-bright)" : "var(--sv-text)" }}>
              {safeValues[i]}
            </strong>
          </li>
        ))}
      </ul>
    </div>
  );
};
