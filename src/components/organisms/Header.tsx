'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <AppBar position="fixed" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 'none', borderBottom: 'var(--border-main)', zIndex: 1201 }}>
      <Toolbar 
        suppressHydrationWarning
        sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto 1fr', 
          alignItems: 'center',
          minHeight: { xs: 64, sm: 72 } 
        }}
      >
        <Box display="flex" justifyContent="flex-start">
          <Typography
            variant="h6"
            onClick={() => router.push('/')}
            sx={{ 
              fontWeight: 1000, 
              color: 'black', 
              letterSpacing: -1, 
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: { xs: 'none', sm: 'block' },
              fontSize: '0.9rem',
              opacity: 0.5
            }}
          >
            Dashboard
          </Typography>
        </Box>

        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => router.push('/')}
          sx={{ cursor: 'pointer' }}
        >
          <Typography
            variant="h5"
            sx={{ 
              fontWeight: 1000, 
              color: 'black', 
              letterSpacing: -2, 
              textTransform: 'uppercase',
              fontSize: { xs: '1.2rem', sm: '1.5rem' }
            }}
          >
            NIGHT QUIZ
          </Typography>
        </Box>

        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
          <IconButton onClick={() => router.push('/profile')} size="small">
            <Avatar
              sx={{
                bgcolor: 'white',
                color: 'black',
                width: 36,
                height: 36,
                fontWeight: 1000,
                fontSize: '0.9rem',
                border: 'var(--border-main)',
                borderRadius: 'var(--border-radius-sm)'
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
