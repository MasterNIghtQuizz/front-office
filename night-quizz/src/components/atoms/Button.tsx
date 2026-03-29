import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

export interface ButtonProps extends MuiButtonProps {
  label: string;
}

export const Button: React.FC<ButtonProps> = ({ label, variant = "contained", color = "primary", ...props }) => {
  return (
    <MuiButton variant={variant} color={color} {...props}>
      {label}
    </MuiButton>
  );
};
