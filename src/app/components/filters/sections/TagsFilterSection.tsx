"use client";

import React, { useState } from "react";
import FilterSection from "../FilterSection";
import TagChip from "../../tags/TagChip";
import TagManagerPopover from "../../tags/TagManagerPopover";
import type { Tag } from "../../../types";

import { useFilters } from "../../../providers/filters/useFilters";

export default function TagsFilterSection() {
  const { tags, selectedTagIds, toggleTag, createTag, editTag } = useFilters();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const selectedTags = tags.filter((t) => selectedTagIds.has(t.id));

  return (
    <FilterSection
      title="Tags"
      onAddClick={(e) => setAnchorEl(e.currentTarget)}
    >
      <TagManagerPopover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        tags={tags}
        selectedTagIds={selectedTagIds}
        onToggleTag={toggleTag}
        onCreateTag={createTag}
        onEditTag={editTag}
      />

      <div className="flex flex-wrap gap-2 mt-2">
        {selectedTags.length === 0 ? (
          <p className="text-xs text-dark-green-2 italic">No tags selected</p>
        ) : (
          selectedTags.map((tag) => (
            <div
              key={tag.id}
              className="transition rounded-full"
              onClick={() => toggleTag(tag.id)}
            >
              <TagChip
                tag={tag}
                showRemoveButton={selectedTagIds.has(tag.id)}
                onRemoveClick={() => toggleTag(tag.id)}
              />
            </div>
          ))
        )}
      </div>
    </FilterSection>
  );
}
