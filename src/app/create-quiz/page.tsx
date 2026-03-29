'use client';

import React, { useState } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import { AuthenticatedLayout } from '@/components/templates/AuthenticatedLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ErrorResponse, CreateQuizRequest, Quiz } from '@/types';

export default function CreateQuizPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const payload: CreateQuizRequest = { title, description };
      await api.post<Quiz>('/quizzes', payload);
      
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      setError(error.response?.data?.message || 'Failed to create quiz');
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <Box maxWidth="sm" mx="auto" pt={4}>
        <Typography variant="h4" fontWeight={800} mb={3}>
          Créer un Quizz
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Input
            label="Titre du Quizz"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="Ex: Culture Générale"
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            placeholder="Courte description de ce quizz..."
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button 
            type="submit" 
            label="Créer" 
            disabled={loading} 
            size="large" 
            sx={{ alignSelf: 'center', px: 6, mt: 2 }} 
          />
        </Box>
      </Box>
    </AuthenticatedLayout>
  );
}
