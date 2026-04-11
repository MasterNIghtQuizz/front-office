import React from 'react';
import { TextField as MuiTextField, TextFieldProps } from '@mui/material';

export const Input: React.FC<TextFieldProps> = (props) => {
  return (
    <MuiTextField
      variant="filled"
      fullWidth
      slotProps={{
        input: {
          disableUnderline: true,
          sx: { 
            borderRadius: 'var(--border-radius-sm)', 
            backgroundColor: 'white !important',
            border: 'var(--border-main)',
            transition: 'all 0.1s',
            '&.Mui-focused': {
              backgroundColor: 'white !important',
              border: 'var(--border-thick)',
            },
            '& input': {
              padding: '24px 28px',
              fontWeight: 800,
              fontSize: '1.1rem',
              '&::placeholder': {
                color: 'black',
                opacity: 0.5,
                textTransform: 'uppercase'
              }
            }
          }
        }
      }}
      sx={{
        '& .MuiInputBase-root': {
          borderRadius: 'var(--border-radius-sm)',
        }
      }}
      {...props}
    />
  );
};
