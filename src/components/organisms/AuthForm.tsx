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
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="h5" fontWeight={700} textAlign="center" mb={2}>
        {title}
      </Typography>
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        label="Mot de passe"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button
        label={isLogin ? 'Se connecter' : 'S\'inscrire'}
        type="submit"
        disabled={loading}
        size="large"
        sx={{ mt: 2 }}
      />
    </Box>
  );
};
