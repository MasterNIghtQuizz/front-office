import React from 'react';
import { Box, Container, Paper } from '@mui/material';
import { Button } from '@/components/atoms/Button';
import { useRouter } from 'next/navigation';

export const AuthTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        position: 'relative'
      }}
    >
      <Box sx={{ position: 'absolute', top: 24, left: 24 }}>
        <Button
          label="RETOUR"
          variant="outlined"
          onClick={() => router.push('/')}
          sx={{
            color: 'black',
            borderColor: 'black',
            fontWeight: 1000,
            borderRadius: 'var(--border-radius-sm)',
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px',
              background: '#f5f5f5'
            }
          }}
        />
      </Box>
      <Container maxWidth="xs" className="animate-up">
        <Paper
          sx={{
            p: 5,
            borderRadius: 'var(--border-radius-md)',
            border: 'var(--border-thick)',
            boxShadow: 'none',
            background: 'white'
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
};
