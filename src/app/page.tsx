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
  }, [token, setToken]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'white',
        color: 'black',
        textAlign: 'center',
        p: 3
      }}
    >
      <Container maxWidth="sm" className="animate-up">
        <Box mb={4}>
          <Image src="/logo.png" alt="NightQuizz Logo" width={80} height={80} style={{ borderRadius: 8, border: 'var(--border-main)' }} />
        </Box>
        <Typography
          variant="h1"
          fontWeight={1000}
          sx={{ 
            mb: 2, 
            letterSpacing: '-0.05em',
            color: 'black',
            textTransform: 'uppercase',
            fontSize: { xs: '3.5rem', sm: '5rem', md: '6rem' },
            lineHeight: 1
          }}
        >
          NightQuizz
        </Typography>

        <Typography variant="h6" sx={{ mb: { xs: 4, sm: 6 }, fontWeight: 800, color: 'black', maxWidth: 500, mx: 'auto', textTransform: 'uppercase', letterSpacing: 1, fontSize: { xs: '0.8rem', sm: '1rem' } }}>
          La plateforme ultime pour créer et participer à des quiz en direct.
        </Typography>

        {mounted ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
            {token ? (
              <Button
                label="DASHBOARD"
                size="large"
                onClick={() => router.push('/dashboard')}
                sx={{
                  background: 'black',
                  color: 'white',
                  px: 5,
                  py: 2,
                  borderRadius: 'var(--border-radius-sm)',
                  fontWeight: 1000,
                  border: 'var(--border-main)',
                  '&:hover': { background: '#333' }
                }}
              />
            ) : (
              <>
                <Button
                  label="CONNEXION"
                  size="large"
                  onClick={() => router.push('/login')}
                  sx={{
                    background: 'white',
                    color: 'black',
                    px: 4,
                    py: 2,
                    borderRadius: 'var(--border-radius-sm)',
                    fontWeight: 1000,
                    border: 'var(--border-main)',
                    '&:hover': { background: '#f5f5f5' }
                  }}
                />
                <Button
                  label="INSCRIPTION"
                  size="large"
                  onClick={() => router.push('/register')}
                  sx={{
                    background: 'white',
                    color: 'black',
                    px: 4,
                    py: 2,
                    borderRadius: 'var(--border-radius-sm)',
                    fontWeight: 1000,
                    border: 'var(--border-main)',
                    '&:hover': { background: '#f5f5f5' }
                  }}
                />
              </>
            )}
            <Button
                label="REJOINDRE"
                size="large"
                onClick={() => router.push('/join')}
                sx={{
                  background: 'black',
                  color: 'white',
                  px: 4,
                  py: 2,
                  borderRadius: 'var(--border-radius-sm)',
                  fontWeight: 1000,
                  border: 'var(--border-main)',
                  '&:hover': { background: '#333' }
                }}
              />
          </Stack>

        ) : (
          <Box height={52} />
        )}
      </Container>
    </Box>
  );
}
