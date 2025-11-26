"use client";

import React from "react";
import { Button, Switch } from "@mui/material";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import FormButton from "@/src/common/button/FormButton";

type Props = {
  /** children sections (Boards, Tags, Calendar, anything) */
  children: React.ReactNode;

  /** Should the sidebar show a Clear All button? */
  showClearAll?: boolean;

  /** Should the sidebar show Smart Recommendations toggle? */
  showSmartRecommendations?: boolean;

  /** Handler for Clear All button (required if showClearAll=true) */
  onClearAll?: () => void;

  /** Smart Recommendation value + setter */
  smartRecommendations?: boolean;
  onChangeSmartRecommendations?: (v: boolean) => void;

  loading?: boolean;
  error?: string | null;
};

export default function FilterSidebar({
  children,
  showClearAll = true,
  showSmartRecommendations = true,
  onClearAll,
  smartRecommendations = false,
  onChangeSmartRecommendations,
  loading = false,
  error = null,
}: Props) {
  if (loading) {
    return (
      <div className="w-full h-full max-w-2xs border border-green-4 bg-off-white p-6 flex justify-center items-center">
        <p className="text-dark-green-1 text-sm animate-pulse">
          Loading filters…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full overflow-y-auto max-w-2xs border border-red-300 bg-red-50 p-6">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <aside className="w-full h-full max-w-2xs border border-green-4 bg-off-white flex flex-col pt-4">
      {/* ───── Top STATIC section ───── */}
      <div className="w-full flex flex-col gap-4 px-4 pb-2">
        {/* Clear All / optional */}
        {showClearAll && (
          <FormButton
            onClick={onClearAll}
            text="Clear All Filters"
            variant="clear"
          />
        )}

        {/* Smart Recommendations / optional */}
        {showSmartRecommendations && (
          <div className="flex items-center justify-between text-small-header text-dark-green-1">
            <div className="flex items-center gap-1">
              <TipsAndUpdatesRoundedIcon className="text-red w-5 h-5" />
              <p className="text-dark-green-1">Smart Recommendations</p>
            </div>
            <Switch
              size="small"
              checked={smartRecommendations}
              onChange={(e) => onChangeSmartRecommendations?.(e.target.checked)}
              color="success"
            />
          </div>
        )}
      </div>

      {/* ───── BOTTOM SCROLL SECTION FOR FILTERS ───── */}
      <div className="scroll-shadows-intense w-full overflow-y-auto flex flex-col gap-4 px-4 pb-4 pt-2">
        {children}
      </div>
    </aside>
  );
}
