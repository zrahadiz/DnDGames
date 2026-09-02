import CustomFieldLabel from "@/components/forms/customFieldLabel";
import { Badge } from "@/components/ui/badge";
import { CampaignWithRelations } from "@/types/campaigns";

// ─── Campaign row card ────────────────────────────────────────────────────────
export default function CampaignRowCard({
  campaign,
  isSelected,
  isExpanded,
  onToggleExpand,
  onSelect,
}: {
  campaign: CampaignWithRelations;
  isSelected: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onSelect: () => void;
}) {
  const worldSetupEntries = Object.entries(campaign.worldSetup ?? {}).slice(
    0,
    4,
  );

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        isSelected
          ? "border-[rgba(200,169,110,0.5)] bg-[rgba(200,169,110,0.06)]"
          : "border-[rgba(200,169,110,0.1)] bg-black/20 hover:border-[rgba(200,169,110,0.25)]"
      }`}
    >
      {/* Row header — always visible */}
      <div className="flex items-center gap-3 p-3">
        {/* Title + meta */}
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-cinzel text-sm font-semibold tracking-wide text-[#e8d5a3] truncate">
              {campaign.title}
            </span>
            {campaign.isOfficial && (
              <Badge className="border-[rgba(200,169,110,0.3)] bg-[rgba(200,169,110,0.1)] text-[#c8a96e] text-[10px] font-serif italic px-1.5 py-0">
                ✦ Official
              </Badge>
            )}
          </div>
          <span className="text-[11px] font-serif italic text-[#5a4830] truncate">
            {campaign.theme?.name} · by {campaign.creator?.name ?? "Unknown"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Expand toggle */}
          <button
            type="button"
            onClick={onToggleExpand}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-[rgba(200,169,110,0.15)] bg-transparent text-[#5a4830] transition-all hover:border-[rgba(200,169,110,0.3)] hover:text-[#8a6f3e]"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <svg
              viewBox="0 0 12 12"
              width="11"
              height="11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>

          {/* Select button */}
          <button
            type="button"
            onClick={onSelect}
            className={`rounded-lg px-3 py-1.5 text-[11px] font-cinzel tracking-wide transition-all duration-150 ${
              isSelected
                ? "border border-[rgba(200,169,110,0.5)] bg-[rgba(200,169,110,0.15)] text-[#e8d5a3] cursor-default"
                : "border border-[rgba(200,169,110,0.25)] bg-[rgba(200,169,110,0.06)] text-[#d4b87a] hover:border-[rgba(200,169,110,0.45)] hover:bg-[rgba(200,169,110,0.12)] active:scale-95"
            }`}
          >
            {isSelected ? "✦ Selected" : "Select"}
          </button>
        </div>
      </div>

      {/* Expanded detail panel */}
      {isExpanded && (
        <div
          className="border-t border-[rgba(200,169,110,0.08)] px-4 pb-4 pt-3 space-y-3"
          style={{ background: "rgba(0,0,0,0.15)" }}
        >
          {/* Description */}
          {campaign.description && (
            <p className="text-[13px] font-serif italic leading-relaxed text-[#7a6548]">
              {campaign.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Background lore */}
            {campaign.backgroundLore && (
              <div className="space-y-1">
                <CustomFieldLabel>Background Lore</CustomFieldLabel>
                <p className="text-xs font-serif text-[#6a5838] leading-relaxed">
                  {campaign.backgroundLore}
                </p>
              </div>
            )}

            {/* Starting objective */}
            {campaign.startingObjective && (
              <div className="space-y-1">
                <CustomFieldLabel>Starting Objective</CustomFieldLabel>
                <p className="text-xs font-serif text-[#6a5838] leading-relaxed">
                  {campaign.startingObjective}
                </p>
              </div>
            )}
          </div>

          {/* World setup */}
          {worldSetupEntries.length > 0 && (
            <div className="space-y-1.5">
              <CustomFieldLabel>World Setup</CustomFieldLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {worldSetupEntries.map(([k, v]) => (
                  <div
                    key={k}
                    className="rounded-lg border border-[rgba(200,169,110,0.08)] bg-black/20 px-2.5 py-1.5"
                  >
                    <span className="block text-[10px] font-cinzel tracking-wide text-[#4a3820]">
                      {k}
                    </span>
                    <span className="block text-[11px] font-serif italic text-[#6a5838] truncate">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Starting location */}
          {campaign.startingLocation && (
            <div className="flex items-center gap-2">
              <CustomFieldLabel>Starting Location</CustomFieldLabel>
              <span className="text-[11px] font-serif italic text-[#6a5838]">
                {campaign.startingLocation}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
