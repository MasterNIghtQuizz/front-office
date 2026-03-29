'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import { AuthenticatedLayout } from '@/components/templates/AuthenticatedLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import api from '@/lib/api';
import { useAuth } from '@/store/useAuth';
import { ErrorResponse, UpdateUserRequest, User } from '@/types';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);

      const payload: UpdateUserRequest = { email };
      if (password) {
        payload.password = password;
      }

      const res = await api.put<User>('/user/me', payload);
      setUser(res.data);
      setMessage({ text: 'Profil mis à jour avec succès.', type: 'success' });
      setPassword('');
    } catch (err: unknown) {
      const error = err as ErrorResponse;
      setMessage({ text: error.response?.data?.message || 'Erreur lors de la mise à jour', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <Box maxWidth="sm" mx="auto" pt={4}>
        <Typography variant="h4" fontWeight={800} mb={1}>
          Mon Profil
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Gérez vos informations et préférences.
        </Typography>

        <Box component="form" onSubmit={handleUpdate} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Nouveau mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Laissez vide pour ne pas changer"
          />

          {user?.role === 'admin' && (
            <Box mt={2} p={2} sx={{ bgcolor: 'rgba(94, 79, 246, 0.05)', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                Mode Admin
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous avez les droits d&apos;administrateur.
              </Typography>
            </Box>
          )}

          {message && <Alert severity={message.type}>{message.text}</Alert>}
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              label="Déconnexion"
              color="error"
              variant="contained"
              onClick={logout}
            />
            <Button
              type="submit"
              label="Enregistrer"
              disabled={loading}
            />
          </Box>
        </Box>
      </Box>
    </AuthenticatedLayout>
  );
}
