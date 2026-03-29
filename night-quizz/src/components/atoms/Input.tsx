import React from 'react';
import { TextField as MuiTextField, TextFieldProps } from '@mui/material';

export const Input: React.FC<TextFieldProps> = (props) => {
  return (
    <MuiTextField
      variant="outlined"
      fullWidth
      margin="normal"
      {...props}
    />
  );
};
