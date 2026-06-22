/**
 * StockGauge — segmented horizontal bar (14 slots) styled like a stack of
 * diapers / formula scoops. Brief F2 phare visual.
 */
export function StockGauge({ filled, total = 14 }: { filled: number; total?: number }) {
  const ratio = Math.max(0, Math.min(1, filled / total));
  const filledCount = Math.round(ratio * total);
  return (
    <div className="flex gap-[3px]" aria-label={`${filled} sur ${total}`} role="meter" aria-valuenow={filled} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="h-3 flex-1 rounded-sm"
          style={{
            background: i < filledCount ? "var(--accent)" : "var(--soft)",
          }}
        />
      ))}
    </div>
  );
}
