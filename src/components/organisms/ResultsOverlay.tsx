'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Fade, Zoom, CircularProgress } from '@mui/material';
import { useSession } from '@/store/useSession';
import api from '@/lib/api';
import { ParticipantResponse } from '@/types';

export const ResultsOverlay: React.FC = () => {
  const { resultsDisplayed, sessionId, participantId, currentQuestion, role } = useSession();
  const [response, setResponse] = useState<ParticipantResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resultsDisplayed && role === 'user' && sessionId && participantId && currentQuestion) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          // Fetch current results to see if the user got it right
          const res = await api.get<ParticipantResponse[]>(`/responses/participant/${participantId}?sessionId=${sessionId}`);
          const currentResult = res.data.find(r => r.questionId === currentQuestion.id);
          setResponse(currentResult || null);
        } catch (error) {
          console.error('Failed to fetch results', error);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    } else if (!resultsDisplayed) {
      setResponse(null);
    }
  }, [resultsDisplayed, sessionId, participantId, currentQuestion, role]);

  if (!resultsDisplayed || role === 'moderator') return null;

  const isCorrect = response?.isCorrect ?? false;

  return (
    <Fade in={resultsDisplayed}>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2000,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          textAlign: 'center'
        }}
      >
        <Zoom in={resultsDisplayed} style={{ transitionDelay: '300ms' }}>
          <Box
            sx={{
              p: { xs: 4, sm: 6 },
              borderRadius: 'var(--border-radius-md)',
              background: isCorrect 
                ? 'linear-gradient(135deg, #28D07C 0%, #21B36A 100%)' 
                : 'linear-gradient(135deg, #FF4B5C 0%, #D32F2F 100%)',
              border: '8px solid black',
              boxShadow: '0px 30px 60px rgba(0,0,0,0.5)',
              maxWidth: 500,
              width: '100%',
              transform: 'rotate(-2deg)',
              position: 'relative'
            }}
          >
            {loading ? (
              <CircularProgress sx={{ color: 'white' }} />
            ) : (
              <>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '4rem', sm: '6rem' }, 
                    mb: 2,
                    filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.3))'
                  }}
                >
                  {isCorrect ? '✨' : '💀'}
                </Typography>
                
                <Typography 
                  variant="h2" 
                  fontWeight={1000} 
                  sx={{ 
                    color: 'white', 
                    letterSpacing: -4, 
                    textTransform: 'uppercase',
                    lineHeight: 0.9,
                    mb: 3,
                    textShadow: '4px 4px 0px black',
                    fontSize: { xs: '3rem', sm: '4rem' }
                  }}
                >
                  {isCorrect ? 'GAGNÉ !' : 'PERDU !'}
                </Typography>

                <Typography 
                  variant="h6" 
                  fontWeight={800} 
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)', 
                    textTransform: 'uppercase',
                    fontSize: { xs: '0.9rem', sm: '1.25rem' }
                  }}
                >
                  {isCorrect 
                    ? 'INCROYABLE, TU AS EU BON !' 
                    : 'DOMMAGE, TU FERAS MIEUX LA PROCHAINE FOIS.'}
                </Typography>

                {response && (
                  <Box 
                    sx={{ 
                      mt: 4, 
                      bgcolor: 'black', 
                      color: 'white', 
                      display: 'inline-block',
                      px: 3,
                      py: 1,
                      borderRadius: 'var(--border-radius-sm)',
                      fontWeight: 1000,
                      transform: 'rotate(2deg)'
                    }}
                  >
                    {isCorrect ? `+${response.scoreObtained} POINTS` : '0 POINTS'}
                  </Box>
                )}
              </>
            )}
          </Box>
        </Zoom>

        <Typography 
          variant="body2" 
          sx={{ 
            mt: 4, 
            color: 'rgba(255,255,255,0.5)', 
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: 2
          }}
        >
          En attente du modérateur...
        </Typography>
      </Box>
    </Fade>
  );
};
