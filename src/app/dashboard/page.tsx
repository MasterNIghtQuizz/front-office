'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { QuizCard } from '@/components/molecules/QuizCard';
import { AuthenticatedLayout } from '@/components/templates/AuthenticatedLayout';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Quiz } from '@/types';

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
      <Box maxWidth="sm" mx="auto" pt={2} pb={10}>
        <Typography variant="h4" fontWeight={800} mb={3}>
          Sélection Quizz
        </Typography>

        {quizzes.length === 0 ? (
          <Typography variant="body1" color="text.secondary" textAlign="center" mt={4}>
            Aucun quiz trouvé. Créez-en un !
          </Typography>
        ) : (
          quizzes.map((q) => (
            <QuizCard
              key={q.id}
              title={q.title}
              description={q.description || 'Appuyez pour voir plus'}
              onClick={() => router.push(`/dashboard/${q.id}`)}
            />
          ))
        )}
      </Box>
      <Fab 
        color="primary" 
        variant="extended"
        onClick={() => router.push('/create-quiz')}
        sx={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 4,
          fontWeight: 700,
          boxShadow: '0px 4px 14px rgba(94, 79, 246, 0.4)'
        }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Créer un Quizz
      </Fab>
    </AuthenticatedLayout>
  );
}
