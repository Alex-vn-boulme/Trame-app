import { PARENTS, type ParentKey } from "@/design/people";

type AvatarProps = {
  who?: ParentKey;
  /** Override the fixture (real-user case). */
  initial?: string;
  color?: string;
  size?: number;
  ring?: boolean;
  className?: string;
};

export function Avatar({ who = "L", initial, color, size = 22, ring = false, className }: AvatarProps) {
  const p = PARENTS[who] ?? PARENTS.L;
  const bg = color ?? p.color;
  const ch = initial ?? p.initial;
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white font-sans font-semibold ${
        ring ? "ring-2 ring-card" : ""
      } ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: bg,
        fontSize: size * 0.45,
        letterSpacing: 0,
      }}
      aria-hidden
    >
      {ch}
    </span>
  );
}

export function AvatarStack({ list = ["L", "T"] as ParentKey[], size = 22 }: { list?: ParentKey[]; size?: number }) {
  return (
    <span className="inline-flex">
      {list.map((w, i) => (
        <span key={`${w}-${i}`} style={{ marginLeft: i ? -size * 0.35 : 0 }}>
          <Avatar who={w} size={size} ring />
        </span>
      ))}
    </span>
  );
}
