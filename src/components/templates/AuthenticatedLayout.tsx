'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { Header } from '../organisms/Header';
import { useAuth } from '@/store/useAuth';
import { useRouter } from 'next/navigation';

export const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, setToken } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');

    const checkAuth = async () => {
      if (!token && storedToken) {
        setToken(storedToken);
      }
      else if (token) {
        setChecking(false);
      }
      else if (!storedToken && typeof window !== 'undefined') {
        router.replace('/login');
      }
    };

    checkAuth().finally(() => {
      if (!token && !storedToken) setChecking(true); // stay loading if redirecting
      else setChecking(false);
    });
  }, [token, router, setToken]);

  if (checking) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!token && typeof window !== 'undefined') {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'white' }}>
      <Header />
      <Box component="main" sx={{ pt: { xs: 8, sm: 10 }, px: 2, maxWidth: 1200, margin: '0 auto' }}>
        {children}
      </Box>
    </Box>
  );
};
