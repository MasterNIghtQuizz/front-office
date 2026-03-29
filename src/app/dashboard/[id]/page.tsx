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

  if (loading) return <AuthenticatedLayout><Box p={4} display="flex" justifyContent="center"><CircularProgress /></Box></AuthenticatedLayout>;
  if (!quiz) return <AuthenticatedLayout><Box p={4}><Typography>Quizz introuvable.</Typography></Box></AuthenticatedLayout>;

  return (
    <AuthenticatedLayout>
      <Box maxWidth="sm" mx="auto" pt={2} pb={10}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <IconButton onClick={() => router.push('/dashboard')} sx={{ mt: -0.5 }}>
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                {quiz.title}
              </Typography>
              {quiz.description && (
                <Typography variant="body1" color="text.secondary" mt={0.5}>
                  {quiz.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Box display="flex" gap={0.5}>
            <Tooltip title="Modifier le Quiz">
              <IconButton size="small" onClick={() => { setEditTitle(quiz.title); setEditDesc(quiz.description || ''); setOpenEditQuiz(true); }}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Supprimer le Quiz">
              <IconButton color="error" size="small" onClick={handleDeleteQuiz}>
                <DeleteIcon fontSize="small" />
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
                <Chip label={q.type === 'single' ? '🎯 Choix unique' : q.type === 'multiple' ? '✅ Choix multiples' : '⚖️ Vrai/Faux'} size="small" variant="outlined" />
                <Chip label={`${q.timer_seconds}s`} size="small" variant="outlined" />
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
        color="primary"
        variant="extended"
        onClick={() => setOpenAdd(true)}
        sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', px: 4, fontWeight: 700 }}
      >
        <AddIcon sx={{ mr: 1 }} />
        Ajouter Question
      </Fab>

      <Dialog open={openAdd} onClose={() => !adding && setOpenAdd(false)} fullWidth maxWidth="xs">
        <DialogTitle>Nouvelle Question</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Input
              label="Intitulé de la question"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              autoFocus
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Type de question</Typography>
            <Select size="small" value={newType} onChange={(e) => setNewType(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="single">🎯 Choix unique (QCM)</MenuItem>
              <MenuItem value="multiple">✅ Choix multiples (QCM)</MenuItem>
              <MenuItem value="boolean">⚖️ Vrai / Faux</MenuItem>
            </Select>
            <Input
              label="Temps (secondes)"
              type="number"
              inputProps={{ min: 5, max: 120 }}
              value={newTimer}
              onChange={(e) => setNewTimer(Number(e.target.value))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button label="Annuler" variant="text" onClick={() => setOpenAdd(false)} disabled={adding} />
          <Button label="Créer" onClick={handleAddQuestion} disabled={adding || !newLabel.trim()} />
        </DialogActions>
      </Dialog>

      <Dialog open={openEditQuiz} onClose={() => !editingQuiz && setOpenEditQuiz(false)} fullWidth maxWidth="xs">
        <DialogTitle>Modifier le Quiz</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
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
        <DialogActions>
          <Button label="Annuler" variant="text" onClick={() => setOpenEditQuiz(false)} disabled={editingQuiz} />
          <Button label="Enregistrer" onClick={handleUpdateQuiz} disabled={editingQuiz || !editTitle.trim()} />
        </DialogActions>
      </Dialog>
    </AuthenticatedLayout>
  );
}
