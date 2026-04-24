'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/store/useSession';
import { Box, Container, Typography, CircularProgress, Paper, Fade } from '@mui/material';
import { Button } from '@/components/atoms/Button';
import { SessionLobby } from '@/components/organisms/SessionLobby';
import { GameCard } from '@/components/organisms/GameCard';
import { PlayArrow as PlayArrowIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';

export default function GamePage() {
  const { code } = useParams();
  const router = useRouter();
  const {
    status,
    publicKey,
    participants,
    currentQuestion,
    fetchSession,
    getCurrentQuestion,
    startSession,
    nextQuestion,
    submitResponse,
    quitSession,
    loading,
    role
  } = useSession();

  const isModerator = role === 'moderator';

  useEffect(() => {
    const token = localStorage.getItem('gameToken');

    if (!token) {
      router.push(`/join?code=${code}`);
      return;
    }

    const checkAndFetch = async () => {
      try {
        await fetchSession();
        const state = useSession.getState();
        if (state.publicKey && state.publicKey !== code) {
          router.push(`/join?code=${code}`);
        }
      } catch {
        router.push(`/join?code=${code}`);
      }
    };

    checkAndFetch();

    // Rafraichissement automatique des questions desactive temporairement
    // const interval = setInterval(() => {
    //   fetchSession();
    // }, 3000);

    // return () => clearInterval(interval);
  }, [code, fetchSession, getCurrentQuestion, router, status]);

  const handleStart = async () => {
    await startSession();
  };

  const handleNext = async () => {
    await nextQuestion();
  };

  const handleFinish = async () => {
    await quitSession();
    router.push('/');
  };

  const handleQuitRequest = () => {
    if (confirm('Voulez-vous vraiment quitter la session ?')) {
      handleFinish();
    }
  };

  if (!status && loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh" sx={{ background: 'white' }}>
        <CircularProgress sx={{ color: 'black' }} />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      py: 4,
      background: 'white'
    }}>
      <Container maxWidth="md">
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mb={4} 
          gap={2}
          flexWrap="wrap"
        >
          <Box sx={{ order: { xs: 2, sm: 1 } }}>
            <Button
              label="QUITTER"
              size="small"
              onClick={handleQuitRequest}
              sx={{
                backgroundColor: '#FF4B5C !important',
                color: 'white !important',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 1000,
                fontSize: '0.75rem',
                px: 3,
                py: 1,
                border: '2px solid black',
                opacity: 1,
                minWidth: '100px',
                '&:hover': {
                  backgroundColor: '#d32f2f !important',
                  borderColor: 'black'
                }
              }}
            />
          </Box>

          <Typography
            variant="h4"
            fontWeight={1000}
            sx={{
              letterSpacing: -2,
              color: 'black',
              textTransform: 'uppercase',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              flex: { xs: '1 0 100%', sm: '1' },
              textAlign: { xs: 'left', sm: 'center' },
              order: { xs: 1, sm: 2 }
            }}
          >
            NIGHT QUIZ
          </Typography>

          {status === 'QUESTION_ACTIVE' && (
            <Box
              sx={{
                background: 'black',
                px: 2,
                py: 0.5,
                borderRadius: 'var(--border-radius-sm)',
                color: 'white',
                fontWeight: 1000,
                border: 'var(--border-main)',
                order: 3
              }}
            >
              {participants.length} JOUEURS
            </Box>
          )}
        </Box>

        <Fade in={true}>
          <Box>
            {status === 'LOBBY' && (
              <Box>
                <SessionLobby
                  publicKey={publicKey || (code as string)}
                  participants={participants}
                />

                {isModerator && (
                  <Box mt={6} display="flex" justifyContent="center">
                    <Button
                      label="LANCER LA SESSION"
                      onClick={handleStart}
                      startIcon={<PlayArrowIcon sx={{ fontSize: '2rem !important' }} />}
                      sx={{
                        px: 8,
                        py: 2.5,
                        background: 'black',
                        color: 'white',
                        borderRadius: 'var(--border-radius-sm)',
                        fontWeight: 1000,
                        fontSize: '1.2rem',
                        border: 'var(--border-main)',
                        '&:hover': {
                          background: '#333',
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {status === 'QUESTION_ACTIVE' && currentQuestion && (
              <Box>
                <GameCard
                  key={currentQuestion.id}
                  question={currentQuestion}
                  onSubmit={submitResponse}
                />

                {isModerator && (
                  <Box mt={6} display="flex" justifyContent="center">
                    <Button
                      label="Valider la question suivante"
                      onClick={handleNext}
                      endIcon={<NavigateNextIcon />}
                      sx={{
                        px: 6,
                        py: 2,
                        background: 'white',
                        color: 'black',
                        borderRadius: 'var(--border-radius-sm)',
                        border: 'var(--border-thick)',
                        fontWeight: 1000,
                        '&:hover': {
                          background: '#f0f0f0',
                          border: 'var(--border-thick)',
                        }
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            {status === 'QUESTION_ACTIVE' && !currentQuestion && (
              <Box display="flex" flexDirection="column" alignItems="center" py={10} gap={3}>
                <CircularProgress color="inherit" sx={{ color: 'black' }} />
                <Typography variant="h6" fontWeight={800}>CHARGEMENT DE LA QUESTION...</Typography>
              </Box>
            )}

            {status === 'FINISHED' && (
              <Box textAlign="center" py={10}>
                <Paper
                  sx={{
                    p: 8,
                    borderRadius: 'var(--border-radius-md)',
                    bgcolor: 'white',
                    border: 'var(--border-thick)',
                  }}
                >
                  <Typography variant="h1" sx={{ mb: 2 }}>🏆</Typography>
                  <Typography variant="h4" fontWeight={1000} sx={{ letterSpacing: -2, mb: 1, color: 'black' }}>
                    LA SESSION EST TERMINÉE
                  </Typography>
                  <Typography variant="body1" color="black" mb={6} sx={{ fontWeight: 800 }}>
                    MERCI D&apos;AVOIR PARTICIPÉ À CETTE AVENTURE.
                  </Typography>
                  <Box display="flex" justifyContent="center">
                    <Button
                      label="QUITTER LA SESSION"
                      onClick={handleFinish}
                      sx={{
                        borderRadius: 'var(--border-radius-sm)',
                        px: 10,
                        py: 2.5,
                        background: 'black',
                        color: 'white',
                        fontWeight: 1000,
                        border: 'var(--border-main)',
                        '&:hover': {
                          background: '#333'
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        </Fade >

      </Container >
    </Box >
  );
}
