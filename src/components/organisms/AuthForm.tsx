'use client';

import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';
import { LoginRequest, RegisterRequest } from '@/types';

interface AuthFormProps {
  title: string;
  isLogin?: boolean;
  onSubmit: (data: LoginRequest | RegisterRequest) => void;
  loading?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ title, isLogin = true, onSubmit, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h4" fontWeight={1000} textAlign="center" mb={4} sx={{ letterSpacing: -2, textTransform: 'uppercase' }}>
        {title}
      </Typography>
      <Input
        label="EMAIL"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="MOT DE PASSE"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        label={isLogin ? 'SE CONNECTER' : "S'INSCRIRE"}
        type="submit"
        disabled={loading}
        size="large"
        sx={{ 
          mt: 4, 
          py: 2.5,
          background: 'black', 
          color: 'white',
          borderRadius: 'var(--border-radius-sm)',
          fontWeight: 1000,
          border: 'var(--border-main)',
          '&:hover': {
            background: '#333'
          }
        }}
      />
    </Box>
  );
};
