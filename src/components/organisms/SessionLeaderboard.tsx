'use client';

import React, { useEffect } from 'react';
import { Box, Typography, Paper, Fade, Zoom } from '@mui/material';
import { useSession } from '@/store/useSession';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

export const SessionLeaderboard: React.FC = () => {
  const { leaderboard, status, fetchLeaderboard } = useSession();

  useEffect(() => {
    if (status === 'FINISHED') {
      fetchLeaderboard();
    }
  }, [status, fetchLeaderboard]);

  if (status !== 'FINISHED' || !leaderboard) return null;

  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <Fade in={true}>
      <Box sx={{ py: 4, width: '100%', maxWidth: 800, mx: 'auto' }}>
        <Typography 
          variant="h2" 
          fontWeight={1000} 
          sx={{ 
            textAlign: 'center', 
            mb: 10, 
            letterSpacing: -4, 
            textTransform: 'uppercase',
            color: 'black',
            fontSize: { xs: '2.5rem', sm: '4rem' }
          }}
        >
          HALL OF FAME
        </Typography>

        {/* Podium */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'flex-end', 
            gap: { xs: 1, sm: 4 },
            mb: 12,
            height: { xs: 250, sm: 350 },
            px: 2
          }}
        >
          {/* 2nd Place */}
          {top3[1] && (
            <Zoom in={true} style={{ transitionDelay: '300ms' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: 100, sm: 140 } }}>
                <Typography fontWeight={1000} sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '0.8rem', sm: '1rem' } }}>{top3[1].nickname}</Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: { xs: 100, sm: 140 }, 
                    bgcolor: '#4592FF', 
                    border: 'var(--border-thick)', 
                    borderRadius: 'var(--border-radius-sm) var(--border-radius-sm) 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'white',
                    boxShadow: 'var(--shadow-main)'
                  }}
                >
                  <Typography variant="h3" fontWeight={1000}>2</Typography>
                  <Typography variant="body2" fontWeight={800}>{top3[1].score} pts</Typography>
                </Box>
              </Box>
            </Zoom>
          )}

          {/* 1st Place */}
          {top3[0] && (
            <Zoom in={true} style={{ transitionDelay: '500ms' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: 120, sm: 180 } }}>
                <TrophyIcon sx={{ fontSize: { xs: '2.5rem', sm: '4rem' }, color: '#FFC845', mb: 2 }} />
                <Typography fontWeight={1000} sx={{ mb: 2, fontSize: { xs: '1rem', sm: '1.4rem' }, textAlign: 'center' }}>{top3[0].nickname}</Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: { xs: 160, sm: 220 }, 
                    bgcolor: '#FFC845', 
                    border: 'var(--border-thick)', 
                    borderRadius: 'var(--border-radius-sm) var(--border-radius-sm) 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'black',
                    boxShadow: 'var(--shadow-main)',
                    position: 'relative'
                  }}
                >
                  <Typography variant="h1" fontWeight={1000} sx={{ fontSize: { xs: '3.5rem', sm: '6rem' } }}>1</Typography>
                  <Typography variant="h6" fontWeight={1000}>{top3[0].score} pts</Typography>
                </Box>
              </Box>
            </Zoom>
          )}

          {/* 3rd Place */}
          {top3[2] && (
            <Zoom in={true} style={{ transitionDelay: '700ms' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: { xs: 100, sm: 140 } }}>
                <Typography fontWeight={1000} sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '0.8rem', sm: '1rem' } }}>{top3[2].nickname}</Typography>
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: { xs: 80, sm: 100 }, 
                    bgcolor: '#FF4B5C', 
                    border: 'var(--border-thick)', 
                    borderRadius: 'var(--border-radius-sm) var(--border-radius-sm) 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'white',
                    boxShadow: 'var(--shadow-main)'
                  }}
                >
                  <Typography variant="h4" fontWeight={1000}>3</Typography>
                  <Typography variant="body2" fontWeight={800}>{top3[2].score} pts</Typography>
                </Box>
              </Box>
            </Zoom>
          )}
        </Box>

        {/* Other Players */}
        {others.length > 0 && (
          <Paper 
            sx={{ 
              p: 4, 
              borderRadius: 'var(--border-radius-md)', 
              border: 'var(--border-thick)', 
              bgcolor: 'white',
              boxShadow: '0px 20px 0px rgba(0,0,0,0.05)'
            }}
          >
            {others.map((player, index) => (
              <Box 
                key={player.participantId} 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  py: 3,
                  borderBottom: index === others.length - 1 ? 'none' : '4px solid #f5f5f5'
                }}
              >
                <Box display="flex" alignItems="center" gap={4}>
                  <Typography fontWeight={1000} sx={{ color: 'rgba(0,0,0,0.2)', width: 40, fontSize: '1.2rem' }}>#{index + 4}</Typography>
                  <Typography fontWeight={1000} sx={{ fontSize: '1.1rem' }}>{player.nickname}</Typography>
                </Box>
                <Typography fontWeight={1000} sx={{ fontSize: '1.2rem', bgcolor: '#f5f5f5', px: 2, py: 0.5, borderRadius: '8px' }}>{player.score} PTS</Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    </Fade>
  );
};
