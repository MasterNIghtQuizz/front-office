'use client';

import React from 'react';
import { ButtonBase, Box, Typography, keyframes } from '@mui/material';
import { styled } from '@mui/material/styles';

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 87, 87, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(255, 87, 87, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 87, 87, 0); }
`;

const StyledBuzzer = styled(ButtonBase)(({ theme }) => ({
  width: 250,
  height: 250,
  borderRadius: '50%',
  backgroundColor: theme.palette.secondary.main,
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 30px rgba(255, 87, 87, 0.4)',
  transition: 'all 0.2s ease-in-out',
  animation: `${pulse} 2s infinite`,
  '&:active': {
    transform: 'scale(0.95)',
    boxShadow: '0 5px 15px rgba(255, 87, 87, 0.3)',
    animation: 'none',
  },
  '&:hover': {
    backgroundColor: '#ff3d3d',
  }
}));

interface BuzzerButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

export const BuzzerButton: React.FC<BuzzerButtonProps> = ({ onClick, disabled }) => {
  return (
    <StyledBuzzer onClick={onClick} disabled={disabled}>
      <Box 
        sx={{ 
          width: '90%', 
          height: '90%', 
          borderRadius: '50%', 
          border: '4px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography variant="h4" fontWeight={900} sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          BUZZ !
        </Typography>
      </Box>
    </StyledBuzzer>
  );
};
