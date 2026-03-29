/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, Stack } from '@mui/material';
import { Button } from '@/components/atoms/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const { token, setToken } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken && !token) {
      setToken(storedToken);
    }
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
        color: 'white',
        textAlign: 'center',
        p: 3
      }}
    >
      <Container maxWidth="sm">
        <Box mb={4} sx={{ filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.3))' }}>
          <Image src="/logo.png" alt="NightQuizz Logo" width={120} height={120} style={{ borderRadius: 24 }} />
        </Box>
        <Typography
          variant="h2"
          component="h1"
          fontWeight={900}
          sx={{ mb: 2, letterSpacing: '-0.05em', textShadow: '0 4px 10px rgba(0,0,0,0.2)' }}
        >
          Night<Box component="span" color="secondary.main">Quizz</Box>
        </Typography>

        <Typography variant="h6" sx={{ mb: 6, fontWeight: 400, opacity: 0.9 }}>
          La plateforme interactive ultime pour créer, animer et participer à des quiz en direct avec vos amis.
        </Typography>

        {mounted ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {token ? (
              <Button
                label="Accéder au Dashboard"
                size="large"
                onClick={() => router.push('/dashboard')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    bgcolor: 'grey.100',
                    color: 'primary.dark',
                  }
                }}
              />
            ) : (
              <>
                <Button
                  label="Se connecter"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'grey.100',
                      color: 'primary.dark',
                    }
                  }}
                />
                <Button
                  label="Créer un compte"
                  size="large"
                  variant="outlined"
                  onClick={() => router.push('/register')}
                  sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.5)',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                />
              </>
            )}
          </Stack>
        ) : (
          <Box height={52} /> /* Placeholder avoiding Cumulative Layout Shift */
        )}
      </Container>
    </Box>
  );
}
