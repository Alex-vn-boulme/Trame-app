/**
 * SourceFooter — règle d'or du brief §4.
 *
 * Toute carte qui rend une recommandation (dose, délai, seuil, jalon, vaccin,
 * suggestion d'âge) DOIT inclure ce footer avec la citation officielle.
 *
 * Pour les observations heuristiques internes (pas de source officielle), use
 * `<SourceFooter heuristic />` qui rend un état volontairement plus discret.
 *
 * Reference: design_handoff/design_handoff_pia/ui.jsx → `SourceFooter`.
 */

type Org =
  | "HAS"
  | "ANSM"
  | "OMS"
  | "SantePubliqueFrance"
  | "CarnetDeSante"
  | "PMI"
  | "CNGOF"
  | "SFP"
  | "AFPA"
  | "ServicePublic"
  | string;

type SourceFooterProps =
  | {
      heuristic: true;
      compact?: boolean;
      org?: never;
      title?: never;
      year?: never;
      url?: never;
    }
  | {
      heuristic?: false;
      compact?: boolean;
      org: Org;
      title?: string;
      year?: number;
      url?: string;
    };

const ORG_LABEL: Record<string, string> = {
  HAS: "HAS",
  ANSM: "ANSM",
  OMS: "OMS",
  SantePubliqueFrance: "Santé publique France",
  CarnetDeSante: "Carnet de santé",
  PMI: "PMI",
  CNGOF: "CNGOF",
  SFP: "Société française de pédiatrie",
  AFPA: "AFPA",
  ServicePublic: "Service-public.fr",
};

export function SourceFooter(props: SourceFooterProps) {
  const compact = props.compact ?? false;
  const pt = compact ? 6 : 8;
  const mt = compact ? 6 : 10;

  if (props.heuristic) {
    return (
      <div
        className="flex items-center gap-[5px] font-sans text-[10.5px] italic text-sub"
        style={{
          marginTop: mt,
          paddingTop: pt,
          borderTop: "0.5px solid var(--hair)",
          letterSpacing: "0.01em",
        }}
      >
        <InfoBadge />
        <span>Observation Pia · pas une reco médicale</span>
      </div>
    );
  }

  const { org, title, year, url } = props;
  const orgLabel = ORG_LABEL[org] ?? org;

  const content = (
    <div
      className="flex items-center gap-[5px] font-sans text-[10.5px] text-sub"
      style={{
        marginTop: mt,
        paddingTop: pt,
        borderTop: "0.5px solid var(--hair)",
        letterSpacing: "0.01em",
      }}
    >
      <InfoBadge />
      <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
        Source&nbsp;:{" "}
        <span className="font-semibold text-ink">{orgLabel}</span>
        {title && <> · « {title} »</>}
        {year && <> ({year})</>}
      </span>
      <span className="font-sans text-[11px] font-medium text-accent" aria-hidden>
        ↗
      </span>
    </div>
  );

  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Source ${orgLabel}${title ? ` — ${title}` : ""}, ouvre dans un nouvel onglet`}
      >
        {content}
      </a>
    );
  }
  return content;
}

function InfoBadge() {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-[8px] font-bold not-italic"
      style={{
        width: 12,
        height: 12,
        border: "1px solid var(--sub)",
      }}
      aria-hidden
    >
      i
    </span>
  );
}
