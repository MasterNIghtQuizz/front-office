'use client';

import React from 'react';
import { ButtonBase, Paper, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const StyledWrapper = styled(ButtonBase)(() => ({
  width: '100%',
  textAlign: 'left',
  borderRadius: 'var(--border-radius-sm)',
  transition: 'transform 0.1s',
  '&:active': {
    transform: 'scale(0.98)',
  }
}));

const StyledPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'selected'
})<{ selected?: boolean }>(({ selected }) => ({
  padding: '16px 20px',
  width: '100%',
  borderRadius: 'var(--border-radius-sm)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  border: 'var(--border-main)',
  backgroundColor: selected ? 'black' : 'white',
  boxShadow: 'none',
  color: selected ? 'white' : 'black',
  '&:hover': {
    backgroundColor: selected ? 'black' : '#f5f5f5',
  }
}));

interface ChoiceButtonProps {
  text: string;
  selected?: boolean;
  onClick: () => void;
  disabled?: boolean;
  index: number;
}

const colors = [
  '#FF4B5C', '#00B0FF', '#FFB800', '#00BFA5',
  '#9C27B0', '#FF9800', '#E91E63', '#2196F3',
  '#4CAF50', '#FFD600', '#795548', '#607D8B',
  '#F44336', '#3F51B5', '#00BCD4', '#8BC34A',
  '#FFC107', '#673AB7', '#03A9F4', '#CDDC39'
];

export const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, selected, onClick, disabled, index }) => {
  const color = colors[index % colors.length];

  return (
    <StyledWrapper onClick={onClick} disabled={disabled}>
      <StyledPaper
        selected={selected}
        sx={{
          backgroundColor: selected ? color : 'white',
          color: selected ? 'white' : 'black',
          borderColor: color,
          '&:hover': {
            backgroundColor: selected ? color : '#f8f8f8',
          }
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '4px',
              backgroundColor: selected ? 'white' : color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selected ? color : 'white',
              fontSize: '0.8rem',
              fontWeight: 1000
            }}
          >
            {String.fromCharCode(65 + index)}
          </Box>
          <Typography variant="body1" fontWeight={900}>
            {text.toUpperCase()}
          </Typography>
        </Box>
        {selected && (
          <CheckCircleOutlineIcon sx={{ color: 'white' }} />
        )}
      </StyledPaper>
    </StyledWrapper>
  );
};
