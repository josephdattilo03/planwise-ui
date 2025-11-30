import React from 'react'
import FilterSidebar from '../filters/FilterSidebar';
import BoardsFilterSection from '../filters/sections/BoardsFilterSection';
import TagsFilterSection from '../filters/sections/TagsFilterSection';
import { useFilters } from "../../providers/filters/useFilters";
import PriorityFilterSection from '../filters/sections/PriorityFilterSection';

export default function TaskFilterComponent() {
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
        <BoardsFilterSection/>
        <TagsFilterSection/>
        <PriorityFilterSection/>
    </FilterSidebar>
  )
}
