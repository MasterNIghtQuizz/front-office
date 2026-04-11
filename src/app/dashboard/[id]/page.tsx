'use client';

import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Fab, MenuItem, Select, Tooltip, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AuthenticatedLayout } from '@/components/templates/AuthenticatedLayout';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';
import { useRouter, useParams } from 'next/navigation';
import api from '@/lib/api';
import { Quiz, Question, CreateQuestionRequest } from '@/types';
import { QuestionCard } from '@/components/organisms/QuestionCard';
import { useSession } from '@/store/useSession';


export default function QuizDetailsPage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newType, setNewType] = useState('single');
  const [newTimer, setNewTimer] = useState(15);
  const [adding, setAdding] = useState(false);

  const { createSession, loading: sessionLoading } = useSession();


  const [openEditQuiz, setOpenEditQuiz] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editingQuiz, setEditingQuiz] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const [quizRes, questionsRes] = await Promise.all([
          api.get<Quiz>(`/quizzes/${id}`),
          api.get<Question[]>(`/questions/quiz/${id}`)
        ]);
        setQuiz(quizRes.data);
        setQuestions(questionsRes.data.sort((a, b) => a.order_index - b.order_index));
      } catch (err) {
        console.error('Failed to load quiz items', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleUpdateQuiz = async () => {
    try {
      setEditingQuiz(true);
      const res = await api.put<Quiz>(`/quizzes/${id}`, { title: editTitle, description: editDesc });
      setQuiz(res.data);
      setOpenEditQuiz(false);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification du quiz.');
    } finally {
      setEditingQuiz(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!confirm('Voulez-vous vraiment supprimer ce quiz ? Cette action est irréversible.')) return;
    try {
      await api.delete(`/quizzes/${id}`);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la suppression.');
    }
  };

  const handleAddQuestion = async () => {
    if (!id) return;
    try {
      setAdding(true);
      const payload: CreateQuestionRequest = {
        label: newLabel,
        type: newType,
        timer_seconds: newTimer,
        order_index: questions.length + 1,
        quiz_id: id
      };

      const res = await api.post<Question>('/questions', payload);
      setQuestions([...questions, res.data]);
      setOpenAdd(false);
      setNewLabel('');
      setNewTimer(15);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout de la question.");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateLocalQuestion = (reqId: string, updatedData: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === reqId ? { ...q, ...updatedData } : q));
  };

  const handleDeleteLocalQuestion = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;
    try {
      await api.delete(`/questions/${questionId}`);
      setQuestions(questions.filter(q => q.id !== questionId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchSession = async () => {
    try {
      await createSession(id);
      const pk = useSession.getState().publicKey;
      if (pk) {
        router.push(`/game/${pk}`);
      }
    } catch (err) {
      console.error(err);
    }
  };



  if (loading) return <AuthenticatedLayout><Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box></AuthenticatedLayout>;
  if (!quiz) return <AuthenticatedLayout><Box p={4}><Typography>Quizz introuvable.</Typography></Box></AuthenticatedLayout>;

  return (
    <AuthenticatedLayout>
      <Box maxWidth="sm" mx="auto" pt={2} pb={10}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => router.push('/dashboard')} sx={{ mt: -0.5 }}>
              <ArrowBackIcon sx={{ color: 'black' }} />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={1000} sx={{ letterSpacing: -1, textTransform: 'uppercase' }}>
                {quiz.title}
              </Typography>
              {quiz.description && (
                <Typography variant="body2" sx={{ fontWeight: 800, mt: 0.5, textTransform: 'uppercase', opacity: 0.7 }}>
                  {quiz.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Box display="flex" gap={1} alignItems="center">
            <Button
              label="LANCER"
              onClick={handleLaunchSession}
              disabled={sessionLoading || questions.length === 0}
              sx={{
                background: 'black',
                color: 'white',
                px: 4,
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 1000,
                border: 'var(--border-main)',
                '&:hover': {
                  background: '#333'
                }
              }}
            />
            <Tooltip title="Modifier le Quiz">
              <IconButton size="small" onClick={() => { setEditTitle(quiz.title); setEditDesc(quiz.description || ''); setOpenEditQuiz(true); }}>
                <EditIcon fontSize="small" sx={{ color: 'black' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer le Quiz">
              <IconButton size="small" onClick={handleDeleteQuiz}>
                <DeleteIcon fontSize="small" sx={{ color: 'var(--error)' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>


        <Typography variant="h6" fontWeight={700} mb={2}>
          Questions ({questions.length})
        </Typography>

        {questions.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            Aucune question configurée.
          </Typography>
        ) : (
          questions.map((q) => (
            <Box key={q.id} mb={2}>
              <Box display="flex" gap={1} mb={1}>
                <Chip
                  label={q.type === 'single' ? '🎯 CHOIX UNIQUE' : q.type === 'multiple' ? '✅ CHOIX MULTIPLES' : q.type === 'boolean' ? '⚖️ VRAI/FAUX' : '🚨 BUZZER'}
                  size="small"
                  sx={{ fontWeight: 1000, borderRadius: 'var(--border-radius-xs)', border: 'var(--border-main)', background: 'white' }}
                />
                <Chip
                  label={`${q.timer_seconds}S`}
                  size="small"
                  sx={{ fontWeight: 1000, borderRadius: 'var(--border-radius-xs)', border: 'var(--border-main)', background: 'white' }}
                />
              </Box>
              <QuestionCard
                question={q}
                onDelete={handleDeleteLocalQuestion}
                onUpdate={handleUpdateLocalQuestion}
              />
            </Box>
          ))
        )}
      </Box>

      <Fab
        onClick={() => setOpenAdd(true)}
        sx={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          px: 6,
          py: 4,
          background: 'black',
          color: 'white',
          borderRadius: 'var(--border-radius-sm)',
          fontWeight: 1000,
          border: 'var(--border-thick)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.3)',
          zIndex: 1000,
          '&:hover': { background: '#333' }
        }}
        variant="extended"
      >
        <AddIcon sx={{ mr: 1 }} />
        AJOUTER UNE QUESTION
      </Fab>

      <Dialog
        open={openAdd}
        onClose={() => !adding && setOpenAdd(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 'var(--border-radius-md)', border: 'var(--border-thick)', p: 2, boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 1000, letterSpacing: -1 }}>NOUVELLE QUESTION</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={2}>
            <Input
              label="Intitulé de la question"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              autoFocus
            />
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 1000, mb: 1, display: 'block', textTransform: 'uppercase' }}>Type de question</Typography>
              <Select
                size="small"
                fullWidth
                value={newType}
                onChange={(e) => setNewType(e.target.value as string)}
                sx={{
                  borderRadius: 'var(--border-radius-sm)',
                  border: 'var(--border-main)',
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  fontWeight: 800
                }}
              >
                <MenuItem value="single">🎯 CHOIX UNIQUE (QCM)</MenuItem>
                <MenuItem value="multiple">✅ CHOIX MULTIPLES (QCM)</MenuItem>
                <MenuItem value="boolean">⚖️ VRAI / FAUX</MenuItem>
                <MenuItem value="buzzer">🚨 MODE BUZZER</MenuItem>
              </Select>
            </Box>

            <Input
              label="Temps (secondes)"
              type="number"
              inputProps={{ min: 5, max: 120 }}
              value={newTimer}
              onChange={(e) => setNewTimer(Number(e.target.value))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            label="ANNULER"
            variant="outlined"
            onClick={() => setOpenAdd(false)}
            disabled={adding}
            sx={{ border: 'var(--border-main)', color: 'black', '&:hover': { border: 'var(--border-main)', background: '#f5f5f5' } }}
          />
          <Button
            label="CRÉER"
            onClick={handleAddQuestion}
            disabled={adding || !newLabel.trim()}
            sx={{ background: 'black', color: 'white', '&:hover': { background: '#333' } }}
          />
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEditQuiz}
        onClose={() => !editingQuiz && setOpenEditQuiz(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 'var(--border-radius-md)', border: 'var(--border-thick)', p: 2, boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ fontWeight: 1000, letterSpacing: -1 }}>MODIFIER LE QUIZ</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={2}>
            <Input
              label="Titre"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
            />
            <Input
              label="Description"
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              multiline rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            label="ANNULER"
            variant="outlined"
            onClick={() => setOpenEditQuiz(false)}
            disabled={editingQuiz}
            sx={{ border: 'var(--border-main)', color: 'black', '&:hover': { border: 'var(--border-main)', background: '#f5f5f5' } }}
          />
          <Button
            label="ENREGISTRER"
            onClick={handleUpdateQuiz}
            disabled={editingQuiz || !editTitle.trim()}
            sx={{ background: 'black', color: 'white', '&:hover': { background: '#333' } }}
          />
        </DialogActions>
      </Dialog>
    </AuthenticatedLayout>
  )
}

