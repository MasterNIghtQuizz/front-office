'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/store/useSession';
import { Box, Container, Typography, CircularProgress, Fade } from '@mui/material';
import { Button } from '@/components/atoms/Button';
import { SessionLobby } from '@/components/organisms/SessionLobby';
import { GameCard } from '@/components/organisms/GameCard';
import { ResultsOverlay } from '@/components/organisms/ResultsOverlay';
import { QuestionStatsDashboard } from '@/components/organisms/QuestionStatsDashboard';
import { SessionLeaderboard } from '@/components/organisms/SessionLeaderboard';
import { PlayArrow as PlayArrowIcon, NavigateNext as NavigateNextIcon, Visibility as VisibilityIcon } from '@mui/icons-material';



export default function GamePage() {
  const { code } = useParams();
  const router = useRouter();
  const {
    status,
    publicKey,
    participants,
    participantId,
    currentQuestion,

    fetchSession,
    getCurrentQuestion,
    startSession,
    nextQuestion,
    submitResponse,
    showResults,
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

  const isDarkMode = status === 'FINISHED';
  const backgroundColor = isDarkMode ? '#0A0A0B' : 'white';
  const textColor = isDarkMode ? 'white' : 'black';

  return (
    <Box sx={{
      minHeight: '100vh',
      py: 4,
      background: backgroundColor,
      backgroundImage: isDarkMode ? 'radial-gradient(circle at 2px 2px, #1a1a1a 1px, transparent 0)' : 'none',
      backgroundSize: '40px 40px',
      color: textColor,
      transition: 'all 0.3s ease'
    }}>
      <Container maxWidth="md">
        {status !== 'FINISHED' && (
          <Box
            suppressHydrationWarning
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
              gap: 2,
              width: '100%',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                justifyContent: 'space-between',
                alignItems: 'center',
                position: { sm: 'absolute' },
                top: { sm: 0 },
                left: { sm: 0 },
                height: { sm: '100%' },
                pointerEvents: 'none',
              }}
            >
              <Box sx={{ pointerEvents: 'auto' }}>
                <Button
                  label="QUITTER"
                  size="small"
                  onClick={handleQuitRequest}
                  sx={{
                    backgroundColor: '#FF4B5C !important',
                    color: 'white !important',
                    borderRadius: 'var(--border-radius-sm)',
                    fontWeight: 1000,
                    fontSize: '0.7rem',
                    px: 2,
                    py: 0.5,
                    border: '2px solid black',
                    minWidth: '80px',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', pointerEvents: 'auto' }}>
                {status === 'QUESTION_ACTIVE' ? (
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 'var(--border-radius-sm)',
                      color: isDarkMode ? 'white' : 'black',
                      background: isDarkMode ? 'black' : 'white',
                      fontWeight: 1000,
                      border: 'var(--border-main)',
                      whiteSpace: 'nowrap',
                      fontSize: '0.75rem',
                    }}
                  >
                    {participants.length} JOUEURS
                  </Box>
                ) : (
                  <Box sx={{ minWidth: { sm: '100px' } }} />
                )}
              </Box>
            </Box>

            <Typography
              variant="h4"
              fontWeight={1000}
              sx={{
                letterSpacing: -2,
                color: textColor,
                textTransform: 'uppercase',
                fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2.125rem' },
                textAlign: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              NIGHT QUIZ
            </Typography>
          </Box>
        )}

        <Fade in={true}>
          <Box>
            {status === 'LOBBY' && (
              <Box>
                <SessionLobby
                  publicKey={publicKey || (code as string)}
                  participants={participants}
                  participantId={participantId}
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
                        background: isDarkMode ? 'white' : 'black',
                        color: isDarkMode ? 'black' : 'white',
                        borderRadius: 'var(--border-radius-sm)',
                        fontWeight: 1000,
                        fontSize: '1.2rem',
                        border: 'var(--border-main)',
                        '&:hover': { background: isDarkMode ? '#f0f0f0' : '#333' },
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
                  <Box sx={{ width: '100%' }}>
                    <QuestionStatsDashboard />
                    <SessionLeaderboard />
                    <Box mt={2} display="flex" justifyContent="center" gap={3}>
                      <Button
                        label="AFFICHER LES RÉSULTATS"
                        onClick={() => showResults()}
                        startIcon={<VisibilityIcon />}
                        sx={{
                          px: 4,
                          py: 2,
                          background: '#28D07C',
                          color: 'black',
                          borderRadius: 'var(--border-radius-sm)',
                          border: 'var(--border-thick)',
                          fontWeight: 1000,
                          '&:hover': { background: '#21B36A' },
                        }}
                      />
                      <Button
                        label="QUESTION SUIVANTE"
                        onClick={handleNext}
                        endIcon={<NavigateNextIcon />}
                        sx={{
                          px: 4,
                          py: 2,
                          background: 'white',
                          color: 'black',
                          borderRadius: 'var(--border-radius-sm)',
                          border: 'var(--border-thick)',
                          fontWeight: 1000,
                          '&:hover': { background: '#f0f0f0' },
                        }}
                      />
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            <ResultsOverlay />

            {status === 'QUESTION_ACTIVE' && !currentQuestion && (
              <Box display="flex" flexDirection="column" alignItems="center" py={10} gap={3}>
                <CircularProgress color="inherit" sx={{ color: 'black' }} />
                <Typography variant="h6" fontWeight={800}>CHARGEMENT DE LA QUESTION...</Typography>
              </Box>
            )}

            {status === 'FINISHED' && (
              <Box textAlign="center" py={4}>
                <SessionLeaderboard />
                <Box display="flex" justifyContent="center" mt={8}>
                  <Button
                    label="RETOUR À L'ACCUEIL"
                    onClick={handleFinish}
                    sx={{
                      borderRadius: 'var(--border-radius-sm)',
                      px: 8,
                      py: 2,
                      background: 'black',
                      color: 'white',
                      fontWeight: 1000,
                      border: 'var(--border-main)',
                      '&:hover': { background: '#333' },
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Fade>
      </Container>
    </Box>
  );
}
