'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/organisms/AuthForm';
import { AuthTemplate } from '@/components/templates/AuthTemplate';
import { useAuth } from '@/store/useAuth';
import api from '@/lib/api';
import { Alert, Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { AuthResponse, ErrorResponse, RegisterRequest } from '@/types';

export default function RegisterPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post<AuthResponse>('/user/register', data);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthTemplate>
      <AuthForm
        title="Créer un compte"
        isLogin={false}
        onSubmit={handleRegister}
        loading={loading}
      />
      {error && <Alert severity="error" sx={{ mt: 3, borderRadius: 'var(--border-radius-xs)', border: '1px solid var(--error)', fontWeight: 800 }}>{error.toUpperCase()}</Alert>}
      <Box mt={4} textAlign="center">
        <Link component={NextLink} href="/login" sx={{ color: 'black', fontWeight: 1000, textDecoration: 'underline', fontSize: '0.8rem', letterSpacing: 0.5 }}>
          DÉJÀ UN COMPTE ? SE CONNECTER
        </Link>
      </Box>
    </AuthTemplate>
  );
}
