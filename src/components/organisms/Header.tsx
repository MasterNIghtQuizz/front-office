'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import Image from 'next/image';

export const Header: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: '1px solid #eaeaea' }}>
      <Toolbar>
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          onClick={() => router.push('/dashboard')}
          sx={{ flexGrow: 1, cursor: 'pointer' }}
        >
          <Image src="/logo.png" alt="Logo" width={32} height={32} style={{ borderRadius: 8 }} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: '-0.5px' }}
          >
            NightQuizz
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={2}>
          {user?.role === 'admin' && (
            <IconButton
              onClick={() => router.push('/admin')}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                px: 1.5,
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800 }}>ADMIN</Typography>
            </IconButton>
          )}
          <IconButton onClick={() => router.push('/profile')} size="small">
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
