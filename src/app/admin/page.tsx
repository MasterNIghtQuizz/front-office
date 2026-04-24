'use client';

import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AuthenticatedLayout } from '@/components/templates/AuthenticatedLayout';
import api from '@/lib/api';
import { User, Quiz } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/useAuth';
import { Button } from '@/components/atoms/Button';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState('');

  // Edit User State
  const [editUser, setEditUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      router.push('/dashboard');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, quizzesRes] = await Promise.all([
          api.get<User[]>('/user'),
          api.get<Quiz[]>('/quizzes')
        ]);
        setUsers(usersRes.data);
        setQuizzes(quizzesRes.data);
      } catch (err) {
        console.error(err);
        setError('Impossible de charger les données admin (Vériiez les droits).');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, router]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await api.delete(`/user/${id}`);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Supprimer ce quiz ?')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      setQuizzes(quizzes.filter(q => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async () => {
    if (!editUser) return;
    try {
      setUpdating(true);
      const res = await api.put<User>(`/user/${editUser.id}`, { role: newRole });
      setUsers(users.map(u => u.id === editUser.id ? res.data : u));
      setEditUser(null);
    } catch (err) {
      console.error(err);
      alert('Erreur lors du changement de role.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <AuthenticatedLayout><Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box></AuthenticatedLayout>;

  return (
    <AuthenticatedLayout>
      <Box maxWidth="md" mx="auto" pt={2} pb={4}>
        <Typography variant="h4" fontWeight={900} mb={3}>
          Administration <Chip label="System" color="secondary" size="small" sx={{ ml: 1, fontWeight: 800 }} />
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Paper sx={{ mb: 3, borderRadius: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
            <Tab label="Utilisateurs" />
            <Tab label="Tous les Quizz" />
          </Tabs>
        </Paper>

        {tab === 0 ? (
          <Paper sx={{ borderRadius: 3, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={u.role}
                        size="small"
                        color={u.role === 'admin' ? 'primary' : 'default'}
                        variant={u.role === 'admin' ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => { setEditUser(u); setNewRole(u.role); }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUser(u.id)} disabled={u.id === currentUser?.id}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        ) : (
          <Paper sx={{ borderRadius: 3, overflowX: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableCell>Titre</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quizzes.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{q.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{q.id}</Typography>
                    </TableCell>
                    <TableCell>{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={() => router.push(`/dashboard/${q.id}`)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteQuiz(q.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
        <DialogTitle>Modifier le rôle </DialogTitle>
        <DialogContent>
          <Box pt={1}>
            <Typography variant="body2" mb={1}>{editUser?.email}</Typography>
            <Select fullWidth size="small" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <MenuItem value="user">USER</MenuItem>
              <MenuItem value="admin">ADMIN</MenuItem>
            </Select>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button label="Annuler" variant="text" onClick={() => setEditUser(null)} />
          <Button label="Mettre Jours" onClick={handleUpdateRole} disabled={updating} />
        </DialogActions>
      </Dialog>
    </AuthenticatedLayout>
  );
}
