import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  label: string;
}

export const Button: React.FC<ButtonProps> = ({ label, variant = "contained", sx, ...props }) => {
  return (
    <MuiButton 
      variant={variant} 
      disableElevation
      sx={{ 
        borderRadius: '16px', 
        py: 1.5, 
        px: 3, 
        fontWeight: 800,
        textTransform: 'none',
        fontSize: '1rem',
        ...sx 
      }} 
      {...props}
    >
      {label}
    </MuiButton>
  );
};
