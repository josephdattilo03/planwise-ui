import React, { useState } from "react";
import {
  Popover,
  TextField,
  IconButton,
  Box,
  Autocomplete,
  createFilterOptions,
} from "@mui/material";

import TagEditDialog from "./TagEditDialog";

import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";

import TagChip from "./TagChip";
import type { Tag, TagOption } from "../../types";

type Props = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;

  tags: Tag[];
  /** Set of selected tag ids */
  selectedTagIds: Set<number>;

  /** Toggle selection for a single tag id */
  onToggleTag: (id: number) => void;

  /** Create a new tag, returns the created Tag (so we get its id) */
  onCreateTag: (tag: Partial<Tag>) => Tag;

  /** Edit existing tag (you can wire this to a dialog in parent) */
  onEditTag: (tag: Tag) => void;
};

const filter = createFilterOptions<TagOption>();

export default function TagManagerPopover({
  anchorEl,
  open,
  onClose,
  tags,
  selectedTagIds,
  onToggleTag,
  onCreateTag,
  onEditTag,
}: Props) {
  // derive Autocomplete value from external selection
  const selectedValues: TagOption[] = tags.filter((tag) =>
    selectedTagIds.has(tag.id)
  );

  const [editTag, setEditTag] = useState<Tag | null>(null);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      slotProps={{
        paper: {
          sx: {
            ml: 2,
            width: 280,
            borderRadius: "12px",
            p: 1.5,
            boxShadow: 3,
          },
        },
      }}
    >
      <Box sx={{ width: "100%" }}>
        <Autocomplete
          multiple
          freeSolo
          selectOnFocus
          clearOnBlur
          handleHomeEndKeys
          forcePopupIcon
          value={selectedValues}
          options={tags as TagOption[]}
          size="small"
          filterOptions={(options, params) => {
            const filtered = filter(options, params);

            if (params.inputValue !== "") {
              filtered.push({
                // synthetic option for “Add "<input>”
                id: -1,
                name: params.inputValue,
                backgroundColor: "#E0E0E0",
                textColor: "#333333",
                borderColor: "#999999",
                inputValue: params.inputValue,
              });
            }

            return filtered;
          }}
          getOptionLabel={(option) => {
            // typed in directly as string
            if (typeof option === "string") {
              return option;
            }
            // “Add …” synthetic option
            if (option.inputValue) {
              return option.inputValue;
            }
            // regular Tag
            return option.name;
          }}
          renderOption={(props, option) => {
            const { key, ...optionProps } = props;

            return (
              <li key={key} {...optionProps}>
                <div className="group flex w-full items-center justify-between gap-2 font-sans">
                  <TagChip tag={option} />
                  <IconButton
                    size="small"
                    sx={{ "& .MuiSvgIcon-root": { fontSize: 16 } }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditTag(option); // open edit dialog
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizRoundedIcon fontSize="small" />
                  </IconButton>
                </div>
              </li>
            );
          }}
          onChange={(event, newValue) => {
            // Handle “create new tag” first
            let createdTag: Tag | null = null;

            newValue.forEach((option) => {
              if (typeof option === "string") {
                const name = option.trim();
                if (!name) return;
                createdTag = onCreateTag({ name });
              } else if (option.inputValue) {
                const name = option.inputValue.trim();
                if (!name) return;
                createdTag = onCreateTag({ name });
              }
            });

            if (createdTag) {
              // ensure newly created tag is selected
              onToggleTag(createdTag.id);
              return;
            }

            // For existing tags, compute new selection set
            const newIdSet = new Set(
              newValue
                .filter(
                  (opt): opt is Tag =>
                    typeof opt !== "string" && !opt.inputValue
                )
                .map((t) => t.id)
            );

            // Diff vs previous selection and call onToggleTag as needed
            tags.forEach((tag) => {
              const wasSelected = selectedTagIds.has(tag.id);
              const isSelectedNow = newIdSet.has(tag.id);
              if (wasSelected !== isSelectedNow) {
                onToggleTag(tag.id);
              }
            });
          }}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          disableCloseOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search or create tags"
              variant="filled"
              size="small"
              color="success"
              className="font-sans"
            />
          )}
          renderValue={(value, getItemProps) => (
            <span className="pl-1 italic">{`${value.length} ${value.length > 1 ? "tags" : "tag"} selected`}</span>
          )}
          sx={{
            "& .MuiFormLabel-root": {
              fontSize: "14px",
            },
          }}
        />
      </Box>
      <TagEditDialog
        open={!!editTag}
        tag={editTag}
        onClose={() => setEditTag(null)}
        onSave={(updated) => {
          onEditTag(updated); // calls FiltersContext.editTag if using context
          setEditTag(null);
        }}
      />
    </Popover>
  );
}
