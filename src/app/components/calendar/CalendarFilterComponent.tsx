"use client";

import React, { useEffect, useState } from "react";
import { useFilters } from "../../providers/filters/useFilters";
import FilterSidebar from "../filters/FilterSidebar";
import CalendarFilterSection from "../filters/sections/CalendarFilterSection";
import BoardsFilterSection from "../filters/sections/BoardsFilterSection";
import TagsFilterSection from "../filters/sections/TagsFilterSection";

export default function CalendarFilterComponent() {
  const { loading, error, smartRecs, setSmartRecs, clearAll } = useFilters();

  return (
    <FilterSidebar
      loading={loading}
      error={error}
      showClearAll
      onClearAll={clearAll}
      showSmartRecommendations
      smartRecommendations={smartRecs}
      onChangeSmartRecommendations={setSmartRecs}
    >
      <CalendarFilterSection />
      <BoardsFilterSection />
      <TagsFilterSection />
    </FilterSidebar>
  );
}
