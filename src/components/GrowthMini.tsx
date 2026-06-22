/**
 * Mini weight chart — SVG sparkline + P10–P90 band (OMS).
 * Brief D1: small visualization in the Vigilance card.
 *
 * Reference data is approximate (hardcoded curves for boys/girls 0-24m).
 * Full WHO reference table → Phase 4 expansion.
 */

type Point = { ageMonths: number; weightKg: number };

/** OMS male 0-24m P10/P50/P90 (kg), approximated. */
const WHO_BAND: { months: number; p10: number; p50: number; p90: number }[] = [
  { months: 0,  p10: 2.8, p50: 3.5, p90: 4.3 },
  { months: 1,  p10: 3.6, p50: 4.5, p90: 5.5 },
  { months: 2,  p10: 4.5, p50: 5.5, p90: 6.7 },
  { months: 3,  p10: 5.2, p50: 6.4, p90: 7.7 },
  { months: 6,  p10: 6.6, p50: 7.9, p90: 9.4 },
  { months: 9,  p10: 7.5, p50: 8.9, p90: 10.5 },
  { months: 12, p10: 8.2, p50: 9.6, p90: 11.4 },
  { months: 18, p10: 9.2, p50: 11.0, p90: 13.0 },
  { months: 24, p10: 10.2, p50: 12.0, p90: 14.2 },
];

export function GrowthMini({
  measurements,
  width = 280,
  height = 60,
}: {
  measurements: Point[];
  width?: number;
  height?: number;
}) {
  const months = WHO_BAND.map((b) => b.months);
  const minMonth = months[0];
  const maxMonth = months[months.length - 1];
  const minKg = 2;
  const maxKg = 16;

  const x = (m: number) => ((m - minMonth) / (maxMonth - minMonth)) * width;
  const y = (kg: number) => height - ((kg - minKg) / (maxKg - minKg)) * height;

  // P10/P90 band as a closed polygon.
  const bandTop = WHO_BAND.map((b) => `${x(b.months)},${y(b.p90)}`).join(" ");
  const bandBottom = WHO_BAND.slice().reverse().map((b) => `${x(b.months)},${y(b.p10)}`).join(" ");

  const valid = measurements.filter((p) => p.ageMonths >= minMonth && p.ageMonths <= maxMonth);
  const path = valid.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.ageMonths)},${y(p.weightKg)}`).join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Courbe de poids (P10–P90 OMS)"
      className="block"
    >
      <polygon
        points={`${bandTop} ${bandBottom}`}
        fill="color-mix(in srgb, var(--good) 12%, transparent)"
      />
      {valid.length > 0 && (
        <>
          <path
            d={path}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {valid.map((p, i) => (
            <circle
              key={i}
              cx={x(p.ageMonths)}
              cy={y(p.weightKg)}
              r={2.2}
              fill="var(--ink)"
            />
          ))}
        </>
      )}
    </svg>
  );
}
