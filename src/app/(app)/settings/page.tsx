import { Card } from "@/components/Card";
import { ScreenHeader } from "@/features/views/ScreenHeader";
import { SettingsForm } from "./SettingsForm";
import { signOutAction } from "./logout-action";
import { loadView } from "@/features/views/loadView";

export const dynamic = "force-dynamic";

/**
 * Settings — palette / dark / tone / density + child profile + co-parents +
 * legal disclaimer + RGPD export / delete.
 */
export default async function SettingsPage() {
  const { supabase, userId } = await loadView();
  const { data: members } = await supabase
    .from("household_members")
    .select("user_id, initial, display_name, color")
    .order("created_at", { ascending: true });

  const { data: child } = await supabase
    .from("children")
    .select("name, birth_date, due_date, weight_kg")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader title="Réglages" />

      <main className="space-y-4 px-4 pt-4">
        <SettingsForm />

        {/* Child profile */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Enfant
          </h2>
          <Card pad={12}>
            {child ? (
              <>
                <p className="font-serif text-[15px] text-ink">{child.name}</p>
                <p className="mt-0.5 font-sans text-[12.5px] text-sub">
                  {child.birth_date
                    ? `Né·e le ${new Date(child.birth_date).toLocaleDateString("fr-FR")}`
                    : child.due_date
                    ? `Date prévue ${new Date(child.due_date).toLocaleDateString("fr-FR")}`
                    : "—"}
                  {child.weight_kg && ` · ${child.weight_kg} kg`}
                </p>
              </>
            ) : (
              <p className="font-sans text-[12.5px] text-sub">Aucun enfant enregistré.</p>
            )}
          </Card>
        </section>

        {/* Members */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Co-parents
          </h2>
          <div className="space-y-1.5">
            {(members ?? []).map((m) => (
              <div
                key={m.user_id}
                className="flex items-center gap-3 rounded-xl bg-card px-3 py-2.5"
                style={{ border: "0.5px solid var(--hair)" }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-white font-sans text-[12px] font-semibold"
                  style={{ background: m.color }}
                  aria-hidden
                >
                  {m.initial}
                </span>
                <span className="flex-1 font-serif text-[14px] text-ink">
                  {m.display_name ?? "—"}
                  {m.user_id === userId && (
                    <span className="ml-1 font-sans text-[11.5px] text-sub">· toi</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Legal */}
        <Card pad={12}>
          <p className="font-sans text-[10.5px] uppercase tracking-[0.04em] text-sub">
            Avertissement
          </p>
          <p className="mt-1 font-serif text-[13.5px] leading-tight text-ink">
            Pia est un assistant d&apos;organisation, pas un dispositif médical. En cas de doute,
            contacte ton pédiatre ou le 15.
          </p>
        </Card>

        {/* Account */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Compte
          </h2>
          <form action={signOutAction}>
            <button
              type="submit"
              className="block w-full rounded-xl bg-card px-3 py-2.5 text-left font-sans text-[13.5px] text-ink"
              style={{ border: "0.5px solid var(--hair)" }}
            >
              Se déconnecter
            </button>
          </form>
        </section>

        {/* RGPD */}
        <section>
          <h2 className="mb-2 font-sans text-[11px] uppercase tracking-[0.04em] text-sub">
            Données personnelles
          </h2>
          <div className="space-y-1.5">
            <a
              href="/api/rgpd/export"
              className="block rounded-xl bg-card px-3 py-2.5 font-sans text-[13.5px] text-ink"
              style={{ border: "0.5px solid var(--hair)" }}
            >
              Exporter mes données
            </a>
            <a
              href="/api/rgpd/delete"
              className="block rounded-xl bg-card px-3 py-2.5 font-sans text-[13.5px] text-[color:#c94422]"
              style={{ border: "0.5px solid var(--hair)" }}
            >
              Supprimer mon compte
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
