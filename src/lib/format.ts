/**
 * Tiny date/time formatting helpers — French, no external deps.
 *
 * Brief §1: les chiffres sont en `Geist Mono`. Garder ces formats stables
 * pour que la `tabular-nums` ne saute pas d'une bulle à l'autre.
 */

const RTF = new Intl.RelativeTimeFormat("fr-FR", { numeric: "auto" });

export function relativeFr(target: Date, now: Date = new Date()): string {
  const sec = Math.round((target.getTime() - now.getTime()) / 1000);
  const abs = Math.abs(sec);
  if (abs < 60) return RTF.format(sec, "second");
  if (abs < 3600) return RTF.format(Math.round(sec / 60), "minute");
  if (abs < 86_400) return RTF.format(Math.round(sec / 3600), "hour");
  if (abs < 86_400 * 7) return RTF.format(Math.round(sec / 86_400), "day");
  if (abs < 86_400 * 30) return RTF.format(Math.round(sec / (86_400 * 7)), "week");
  if (abs < 86_400 * 365) return RTF.format(Math.round(sec / (86_400 * 30)), "month");
  return RTF.format(Math.round(sec / (86_400 * 365)), "year");
}

const TZ = "Europe/Paris";

export function hhmm(d: Date): string {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
}

export function dateFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: TZ });
}

export function dateLongFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: TZ });
}

export function durationFr(ms: number): string {
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}'`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}
