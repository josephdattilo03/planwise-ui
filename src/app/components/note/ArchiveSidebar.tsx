'use client';

import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ArchivedNoteChip from './ArchivedNoteChip';

const DRAWER_WIDTH = 280;

export default function ArchiveSidebar({
  archivedNotes,
  restoreNote,
  isOpen,
  toggleSidebar,
}: {
  archivedNotes: any[];
  restoreNote: (id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <>
      <Drawer
        variant="persistent"
        anchor="left"
        open={isOpen}
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: DRAWER_WIDTH,
            height: 'calc(100vh - 78.57px)',
            top: '78.57px',
            borderRight: '1px solid',
            borderColor: 'rgba(0,0,0,0.12)',
            bgcolor: 'background.paper',
            overflowX: 'hidden',
          },
          className: 'border-green-4 bg-off-white',
        }}
      >
        <Box className="flex flex-col pt-4 h-full">
          <p className="text-small-header text-dark-green-2 mb-2 px-6">
            Archived Notes
          </p>

          {archivedNotes.length === 0 ? (
            <p className="text-body text-gray-500 px-6">No archived notes</p>
          ) : (
            <Box className="flex flex-col">
              {archivedNotes.map((note) => (
                <ArchivedNoteChip
                  key={note.id}
                  title={note.title}
                  color={note.color}
                  onRestore={() => restoreNote(note.id)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Drawer>

      <Box
        sx={{
          position: 'fixed',
          top: '50%',
          transform: 'translateY(-50%)',
          left: isOpen ? DRAWER_WIDTH : 0,
          zIndex: (theme) => theme.zIndex.drawer + 2,
          transition: (theme) =>
            theme.transitions.create('left', {
              duration: theme.transitions.duration.shortest,
            }),
        }}
        className="border border-green-4 bg-off-white border-l-0 rounded-r-lg shadow-md"
      >
        <IconButton
          onClick={toggleSidebar}
          sx={{ px: 1.25, py: 1 }}
          aria-label={isOpen ? 'Close archive sidebar' : 'Open archive sidebar'}
        >
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>
    </>
  );
}
