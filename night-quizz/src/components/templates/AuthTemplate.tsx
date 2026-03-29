'use client';
import React from 'react';
import { Box, Container, Paper } from '@mui/material';

export const AuthTemplate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
          {children}
        </Paper>
      </Container>
    </Box>
  );
};
