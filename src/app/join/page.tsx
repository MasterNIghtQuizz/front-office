'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import { useSession } from '@/store/useSession';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

function JoinForm() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [nickname, setNickname] = useState('');
  const { joinSession, loading, error } = useSession();
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !nickname) return;
    try {
      await joinSession(code, nickname);
      router.push(`/game/${code}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      p: 3,
      position: 'relative'
    }}>
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
        <Box textAlign="center" mb={6}>
          <Typography
            variant="h2"
            fontWeight={1000}
            sx={{
              letterSpacing: -3,
              color: 'black',
              mb: 1,
              display: 'inline-block',
              fontSize: { xs: '2.5rem', sm: '3.75rem' }
            }}
          >
            NIGHT QUIZ
          </Typography>
          <Typography sx={{ color: 'black', fontWeight: 800, letterSpacing: 1 }} variant="body1">
            REJOIGNEZ L&apos;ÉLITE DU SAVOIR.
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: 'white',
            p: { xs: 3, sm: 6 },
            borderRadius: 'var(--border-radius-md)',
            border: { xs: 'var(--border-main)', sm: 'var(--border-thick)' },
            textAlign: 'center',
            position: 'relative',
          }}
        >
          <form onSubmit={handleJoin}>
            <Box display="flex" flexDirection="column" gap={4}>
              {error && <Alert severity="error" sx={{ border: 'var(--border-main)', borderRadius: 'var(--border-radius-sm)' }}>{error}</Alert>}

              <Input
                placeholder="CODE DE LA SESSION"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputProps={{
                  style: {
                    fontWeight: 1000,
                    fontSize: '1.4rem',
                    textAlign: 'center',
                    letterSpacing: 2
                  }
                }}
              />

              <Input
                placeholder="VOTRE PSEUDO"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                inputProps={{
                  style: {
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    textAlign: 'center'
                  }
                }}
              />

              <Button
                type="submit"
                label={loading ? 'CONNEXION...' : 'REJOINDRE LA PARTIE'}
                disabled={loading || !code || !nickname}
                sx={{
                  py: 2.5,
                  background: 'black',
                  color: 'white',
                  borderRadius: 'var(--border-radius-sm)',
                  border: 'var(--border-main)',
                  '&:hover': {
                    background: '#333',
                  }
                }}
              />
            </Box>
          </form>
        </Box>
      </Container>
    </Box>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={null}>
      <JoinForm />
    </Suspense>
  );
}
