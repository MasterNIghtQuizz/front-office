'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/organisms/AuthForm';
import { AuthTemplate } from '@/components/templates/AuthTemplate';
import { useAuth } from '@/store/useAuth';
import api from '@/lib/api';
import { Alert, Box, Link } from '@mui/material';
import NextLink from 'next/link';
import { AuthResponse, ErrorResponse, LoginRequest } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const { setToken, setUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError('');
      const res = await api.post<AuthResponse>('/user/login', data);
      setToken(res.data.accessToken);
      setUser(res.data.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthTemplate>
      <AuthForm
        title="Connexion"
        isLogin={true}
        onSubmit={handleLogin}
        loading={loading}
      />
      {error && <Alert severity="error" sx={{ mt: 3, borderRadius: 'var(--border-radius-xs)', border: '1px solid var(--error)', fontWeight: 800 }}>{error.toUpperCase()}</Alert>}
      <Box mt={4} textAlign="center">
        <Link component={NextLink} href="/register" sx={{ color: 'black', fontWeight: 1000, textDecoration: 'underline', fontSize: '0.8rem', letterSpacing: 0.5 }}>
          PAS ENCORE DE COMPTE ? S&apos;INSCRIRE
        </Link>
      </Box>
    </AuthTemplate>
  );
}
