'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { QuizCard } from '@/components/molecules/QuizCard';
import { AuthenticatedLayout } from '@/components/templates/AuthenticatedLayout';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Quiz } from '@/types';
import { Button } from '@/components/atoms/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get<Quiz[]>('/quizzes');
        setQuizzes(res.data);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <AuthenticatedLayout>
      <Box maxWidth="sm" mx="auto" pt={4} pb={12}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={1000} sx={{ letterSpacing: -1 }}>
            DASHBOARD
          </Typography>
          <Button
            label="REJOINDRE UN QUIZ"
            variant="outlined"
            onClick={() => router.push('/join')}
            sx={{
              color: 'black',
              borderColor: 'black',
              borderWidth: '2px',
              fontWeight: 1000,
              borderRadius: 'var(--border-radius-sm)',
              '&:hover': { borderWidth: '2px', background: '#f5f5f5' }
            }}
          />
        </Box>

        <Typography variant="overline" sx={{ fontWeight: 1000, mb: 2, display: 'block', color: 'black', opacity: 0.6 }}>
          MES QUIZZ
        </Typography>

        {quizzes.length === 0 ? (
          <Box sx={{ py: 10, textAlign: 'center', border: 'var(--border-main)', borderRadius: 'var(--border-radius-md)', borderStyle: 'dashed' }}>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              AUCUN QUIZ CRÉÉ POUR LE MOMENT.
            </Typography>
          </Box>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {quizzes.map((q) => (
              <QuizCard
                key={q.id}
                title={q.title.toUpperCase()}
                description={q.description?.toUpperCase() || 'AUCUNE DESCRIPTION'}
                onClick={() => router.push(`/dashboard/${q.id}`)}
              />
            ))}
          </Box>
        )}
      </Box>

      <Fab
        color="primary"
        variant="extended"
        onClick={() => router.push('/create-quiz')}
        sx={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          px: 4,
          background: 'black',
          color: 'white',
          borderRadius: 'var(--border-radius-sm)',
          fontWeight: 1000,
          border: 'var(--border-main)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
          '&:hover': {
            background: '#333'
          }
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        CRÉER UN QUIZZ
      </Fab>
    </AuthenticatedLayout>
  );
}
