'use client';

import React from 'react';
import { Typography, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface QuizCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

import PublicIcon from '@mui/icons-material/Public';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LocalBarIcon from '@mui/icons-material/LocalBar';
import PetsIcon from '@mui/icons-material/Pets';
import MovieIcon from '@mui/icons-material/Movie';

const getIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes('géo')) return <PublicIcon sx={{ color: 'black' }} />;
  if (t.includes('hist')) return <HistoryEduIcon sx={{ color: 'black' }} />;
  if (t.includes('cocktail') || t.includes('culture')) return <LocalBarIcon sx={{ color: 'black' }} />;
  if (t.includes('anim')) return <PetsIcon sx={{ color: 'black' }} />;
  if (t.includes('ciné')) return <MovieIcon sx={{ color: 'black' }} />;
  return <PublicIcon sx={{ color: 'black' }} />;
};

export const QuizCard: React.FC<QuizCardProps> = ({ title, description, onClick }) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        mb: 2,
        cursor: 'pointer',
        transition: 'all 0.1s',
        display: 'flex',
        alignItems: 'center',
        padding: '24px 28px',
        gap: 3,
        border: 'var(--border-thick)',
        borderRadius: 'var(--border-radius-sm)',
        background: 'white',
        '&:hover': {
          background: '#f8f8f8',
          borderColor: 'black'
        }
      }}
    >
      <Box
        sx={{
          minWidth: 48,
          height: 48,
          borderRadius: 'var(--border-radius-xs)',
          border: 'var(--border-main)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getIcon(title)}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="h6" fontWeight={1000} sx={{ fontSize: '1rem', mb: 0.5, letterSpacing: -1 }}>
          {title.toUpperCase()}
        </Typography>
        <Typography variant="body2" sx={{ color: 'black', fontWeight: 800, opacity: 0.6, fontSize: '0.8rem' }}>
          {description.toUpperCase()}
        </Typography>
      </Box>
      <ChevronRightIcon sx={{ color: 'black' }} />
    </Box>
  );
};
