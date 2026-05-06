'use client';

import React from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { useSession } from '@/store/useSession';

export const QuestionStatsDashboard: React.FC = () => {
  const { questionStats, currentQuestion, resultsDisplayed, role } = useSession();

  if (!resultsDisplayed || role !== 'moderator' || !currentQuestion || !questionStats) return null;

  const totalResponses = questionStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <Fade in={resultsDisplayed}>
      <Box sx={{ mt: 8, mb: 10, width: '100%' }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 6 },
            borderRadius: 'var(--border-radius-md)',
            border: 'var(--border-thick)',
            bgcolor: 'white',
            boxShadow: '0px 20px 0px rgba(0,0,0,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              right: 0,
              bgcolor: 'black',
              color: 'white',
              px: 3,
              py: 1,
              borderRadius: '0 0 0 var(--border-radius-sm)',
              fontWeight: 1000,
              fontSize: '0.8rem'
            }}
          >
            LIVE STATS
          </Box>

          <Typography variant="h4" fontWeight={1000} sx={{ mb: 6, mt: 2, letterSpacing: -2, textTransform: 'uppercase', color: 'black' }}>
            RÉPARTITION DES RÉPONSES
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {currentQuestion.choices?.map((choice, index) => {
              const stat = questionStats.find(s => s.choiceId === choice.id);
              const count = stat?.count || 0;
              const percentage = totalResponses > 0 ? (count / totalResponses) * 100 : 0;

              const COLORS = ['#FF4B5C', '#4592FF', '#FFC845', '#28D07C', '#9145FF', '#FF45D8'];
              const color = COLORS[index % COLORS.length];

              return (
                <Box key={choice.id}>
                  <Box display="flex" justifyContent="space-between" mb={1.5} alignItems="flex-end">
                    <Typography
                      fontWeight={1000}
                      sx={{
                        fontSize: '1.2rem',
                        color: choice.is_correct ? '#28D07C' : 'black',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {choice.text} {choice.is_correct && <Box component="span" sx={{ bgcolor: '#28D07C', color: 'white', px: 1, borderRadius: '4px', fontSize: '0.7rem' }}>CORRECT</Box>}
                    </Typography>
                    <Typography fontWeight={1000} sx={{ fontSize: '1.3rem', color: 'black' }}>
                      {count} <Box component="span" sx={{ fontSize: '0.9rem', opacity: 0.5 }}>({Math.round(percentage)}%)</Box>
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      height: 40,
                      width: '100%',
                      bgcolor: '#f5f5f5',
                      borderRadius: 'var(--border-radius-sm)',
                      border: '3px solid black',
                      overflow: 'hidden',
                      position: 'relative',
                      boxShadow: 'inset 0px 4px 0px rgba(0,0,0,0.05)'
                    }}
                  >
                    <Box
                      sx={{
                        height: '100%',
                        width: `${percentage}%`,
                        bgcolor: color,
                        transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        borderRight: percentage > 0 ? '3px solid black' : 'none'
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ mt: 8, pt: 4, borderTop: '4px solid #f0f0f0', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ bgcolor: 'black', color: 'white', px: 4, py: 1.5, borderRadius: 'var(--border-radius-sm)', fontWeight: 1000 }}>
              TOTAL: {totalResponses} RÉPONSES
            </Box>
          </Box>
        </Paper>
      </Box>
    </Fade>
  );
};
