"use client";

import React from "react";
import { Button, Switch } from "@mui/material";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import FormButton from "@/src/common/button/FormButton";

type Props = {
  /** children sections (Boards, Tags, Calendar, anything) */
  children: React.ReactNode;

  /** Custom components to render in the top static section */
  topContent?: React.ReactNode;

  showStaticTop?: boolean;

  // ... existing props remain unchanged ...
  showClearAll?: boolean;
  showSmartRecommendations?: boolean;
  onClearAll?: () => void;
  smartRecommendations?: boolean;
  onChangeSmartRecommendations?: (v: boolean) => void;
  loading?: boolean;
  error?: string | null;
};

export default function FilterSidebar({
  children,
  topContent,
  showStaticTop = true,
  showClearAll = true,
  showSmartRecommendations = true,
  onClearAll,
  smartRecommendations = false,
  onChangeSmartRecommendations,
  loading = false,
  error = null,
}: Props) {
  // ... existing loading/error handling ...

  // Determine if top section should show
  const hasTopContent = topContent || showClearAll || showSmartRecommendations;

  return (
    <aside className="w-full h-full max-w-2xs border border-green-4 bg-off-white flex flex-col pt-4">
      {/* ───── Top STATIC section ───── */}
      {showStaticTop && hasTopContent && (
        <div className="w-full flex flex-col gap-4 px-4 pb-2">
          {/* Custom top content */}
          {topContent}

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
                onChange={(e) =>
                  onChangeSmartRecommendations?.(e.target.checked)
                }
                color="success"
              />
            </div>
          )}
        </div>
      )}

      {/* ───── BOTTOM SCROLL SECTION FOR FILTERS ───── */}
      <div className="scroll-shadows w-full overflow-y-auto flex flex-col gap-4 px-4 pb-4 pt-2">
        {children}
      </div>
    </aside>
  );
}
