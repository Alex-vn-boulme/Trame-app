import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient } from "@/lib/supabase/server";
import { computeStage, formatStage } from "@/domain/stages";
import { entryTitle } from "@/features/chat/extractFields";
import type { EntryType } from "@/domain/types";

/**
 * GET /api/logbook/export — generate a PDF of the household's jalons
 * (and optionally other entry types) grouped by month.
 *
 * Uses pdf-lib (pure JS, no system fonts) with StandardFonts so the PDF
 * embeds nothing custom — keeps the output portable and the bundle tiny.
 * For richer typography (Source Serif 4), fetch the woff2 and embed it
 * later — not needed for MVP export.
 */
export const runtime = "nodejs";
export const maxDuration = 60;

const PAGE_W = 595.28; // A4 in points
const PAGE_H = 841.89;
const MARGIN = 56;
const LINE = 18;

export async function GET() {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: member } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!member?.household_id) {
    return NextResponse.json({ error: "no_household" }, { status: 400 });
  }
  const householdId = member.household_id;

  const { data: child } = await supabase
    .from("children")
    .select("name, birth_date")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  const { data: entries } = await supabase
    .from("entries")
    .select("id, type, payload, created_at")
    .eq("household_id", householdId)
    .in("type", ["jalon", "medic", "symptome"])
    .order("created_at", { ascending: true });

  const pdf = await PDFDocument.create();
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);

  let page = pdf.addPage([PAGE_W, PAGE_H]);
  let cursor = PAGE_H - MARGIN;

  function ensureSpace(needed: number) {
    if (cursor - needed < MARGIN) {
      page = pdf.addPage([PAGE_W, PAGE_H]);
      cursor = PAGE_H - MARGIN;
    }
  }

  // Header.
  page.drawText("Carnet de bord", {
    x: MARGIN, y: cursor, size: 24, font: serifBold, color: rgb(0.16, 0.15, 0.1),
  });
  cursor -= 28;
  if (child?.name) {
    page.drawText(child.name, { x: MARGIN, y: cursor, size: 14, font: serif, color: rgb(0.43, 0.41, 0.34) });
    cursor -= 22;
  }
  page.drawText(
    `Exporté le ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
    { x: MARGIN, y: cursor, size: 10, font: sans, color: rgb(0.43, 0.41, 0.34) },
  );
  cursor -= 32;

  // Group by YYYY-MM.
  const groups = new Map<string, typeof entries>();
  for (const e of entries ?? []) {
    const key = new Date(e.created_at).toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  if (groups.size === 0) {
    page.drawText("Aucun jalon enregistré.", { x: MARGIN, y: cursor, size: 12, font: serif });
  }

  for (const [month, itemsMaybe] of groups) {
    const items = itemsMaybe ?? [];
    ensureSpace(LINE * 3);
    page.drawText(month, { x: MARGIN, y: cursor, size: 14, font: serifBold, color: rgb(0.16, 0.15, 0.1) });
    cursor -= LINE * 1.4;

    for (const e of items) {
      ensureSpace(LINE * 2);
      const date = new Date(e.created_at);
      const dateStr = date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
      const ageStr = child?.birth_date
        ? formatStage(computeStage({ birthDate: new Date(child.birth_date), now: date }), "").replace(/^ · /, "")
        : "";
      const title = entryTitle(e.type as EntryType, e.payload);
      page.drawText(`${dateStr}${ageStr ? `  ·  ${ageStr}` : ""}`, {
        x: MARGIN, y: cursor, size: 9, font: sans, color: rgb(0.43, 0.41, 0.34),
      });
      cursor -= 12;
      page.drawText(truncate(title, 90), { x: MARGIN, y: cursor, size: 12, font: serif, color: rgb(0.16, 0.15, 0.1) });
      cursor -= LINE * 1.1;

      const citation = (e.payload as { citation?: string } | null)?.citation;
      if (typeof citation === "string" && citation.length > 0) {
        page.drawText(`« ${truncate(citation, 100)} »`, {
          x: MARGIN, y: cursor, size: 10, font: serif, color: rgb(0.43, 0.41, 0.34),
        });
        cursor -= LINE;
      }
    }
    cursor -= LINE * 0.8;
  }

  // Footer on the last page.
  page.drawText(
    "Pia n'est pas un dispositif médical. Conserve ce carnet pour ton information personnelle.",
    { x: MARGIN, y: MARGIN / 2, size: 8, font: sans, color: rgb(0.6, 0.6, 0.6) },
  );

  const bytes = await pdf.save();
  const slug = (child?.name ?? "pia").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="carnet-${slug}-${date}.pdf"`,
      "cache-control": "no-store",
    },
  });
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
