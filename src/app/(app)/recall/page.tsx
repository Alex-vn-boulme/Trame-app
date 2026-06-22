import { ScreenHeader } from "@/features/views/ScreenHeader";
import { RecallSearch } from "./RecallSearch";

export const dynamic = "force-dynamic";

/**
 * E1 Recall — natural-language search over the household corpus.
 */
export default function RecallPage({
  searchParams: _ignored,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  void _ignored;
  return (
    <div className="flex min-h-dvh flex-col bg-bg pb-12">
      <ScreenHeader title="Mémoire" subtitle="Demande-moi n'importe quoi sur l'historique" />
      <main className="px-4 pt-4">
        <RecallSearch />
      </main>
    </div>
  );
}
