'use client';

import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography, IconButton, List, ListItem, ListItemText, Checkbox, CircularProgress, Collapse, Divider, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Question, Choice, CreateChoiceRequest } from '@/types';
import api from '@/lib/api';
import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms/Button';

interface QuestionCardProps {
  question: Question;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, data: Partial<Question>) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ question, onDelete, onUpdate }) => {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const [newChoiceText, setNewChoiceText] = useState('');
  const [newChoiceCorrect, setNewChoiceCorrect] = useState(false);
  const [adding, setAdding] = useState(false);

  const [openEditQuestion, setOpenEditQuestion] = useState(false);
  const [editLabel, setEditLabel] = useState(question.label);
  const [editType, setEditType] = useState(question.type);
  const [editTimer, setEditTimer] = useState(question.timer_seconds);
  const [editingQ, setEditingQ] = useState(false);

  const [editChoiceId, setEditChoiceId] = useState<string | null>(null);
  const [editChoiceText, setEditChoiceText] = useState('');
  const [editChoiceCorrect, setEditChoiceCorrect] = useState(false);
  const [editingC, setEditingC] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.get<Choice[]>(`/choices/question/${question.id}`).then(res => {
      if (mounted) {
        setChoices(res.data);
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [question.id]);

  const handleUpdateQuestion = async () => {
    try {
      setEditingQ(true);
      const payload = { label: editLabel, type: editType, timer_seconds: editTimer, order_index: question.order_index };
      const res = await api.put<Question>(`/questions/${question.id}`, payload);
      if (onUpdate) onUpdate(question.id, res.data);
      setOpenEditQuestion(false);
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la modification de la question.');
    } finally {
      setEditingQ(false);
    }
  };

  const handleAddChoice = async () => {
    if (!newChoiceText.trim()) return;
    try {
      setAdding(true);
      const payload: CreateChoiceRequest = {
        text: newChoiceText,
        is_correct: newChoiceCorrect,
        question_id: question.id
      };
      const res = await api.post<Choice>('/choices', payload);
      setChoices([...choices, res.data]);
      setNewChoiceText('');
      setNewChoiceCorrect(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateChoice = async () => {
    if (!editChoiceId || !editChoiceText.trim()) return;
    try {
      setEditingC(true);
      const res = await api.put<Choice>(`/choices/${editChoiceId}`, { text: editChoiceText, is_correct: editChoiceCorrect });
      setChoices(choices.map(c => c.id === editChoiceId ? res.data : c));
      setEditChoiceId(null);
    } catch (err) {
      console.error(err);
    } finally {
      setEditingC(false);
    }
  };

  const handleDeleteChoice = async (choiceId: string) => {
    try {
      await api.delete(`/choices/${choiceId}`);
      setChoices(choices.filter(c => c.id !== choiceId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {question.order_index}. {question.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type : {question.type} | Temps : {question.timer_seconds}s | {choices.length} choix
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={0.5}>
          <Tooltip title="Voir les choix">
            <IconButton onClick={() => setExpanded(!expanded)}>
              <ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Modifier la question">
            <IconButton size="small" onClick={() => setOpenEditQuestion(true)}>
              <EditIcon fontSize="small"/>
            </IconButton>
          </Tooltip>
          <Tooltip title="Supprimer la question">
            <IconButton color="error" size="small" onClick={() => onDelete(question.id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Divider sx={{ my: 2 }} />
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <List dense disablePadding>
            {choices.map(choice => (
              <ListItem 
                key={choice.id} 
                disableGutters 
                secondaryAction={
                   <Box display="flex" gap={0.5}>
                     <IconButton edge="end" size="small" onClick={() => { setEditChoiceId(choice.id); setEditChoiceText(choice.text); setEditChoiceCorrect(choice.is_correct); }}>
                       <EditIcon fontSize="small" />
                     </IconButton>
                     <IconButton edge="end" size="small" color="error" onClick={() => handleDeleteChoice(choice.id)}>
                       <DeleteIcon fontSize="small" />
                     </IconButton>
                   </Box>
                }
              >
                <Checkbox 
                  checked={choice.is_correct} 
                  disableRipple 
                  checkedIcon={<span>✅</span>} 
                  icon={<span>❌</span>} 
                  sx={{ p: 0, mr: 1, pointerEvents: 'none' }} 
                />
                <ListItemText 
                  primary={choice.text} 
                  primaryTypographyProps={{ 
                    fontWeight: choice.is_correct ? 700 : 400,
                    color: choice.is_correct ? 'success.main' : 'text.primary'
                  }} 
                />
              </ListItem>
            ))}
          </List>
        )}

        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <Input 
            size="small"
            placeholder="Texte du choix..." 
            value={newChoiceText}
            onChange={(e) => setNewChoiceText(e.target.value)}
            sx={{ my: 0 }}
          />
          <Box display="flex" alignItems="center" gap={0.5}>
            <Checkbox 
              size="small"
              checked={newChoiceCorrect} 
              onChange={(e) => setNewChoiceCorrect(e.target.checked)} 
              title="Cocher si c'est la bonne réponse"
            />
            <Button 
              label="Ajouter" 
              size="small" 
              disabled={adding || !newChoiceText.trim()} 
              onClick={handleAddChoice} 
              sx={{ minWidth: 80 }}
            />
          </Box>
        </Box>
      </Collapse>

      <Dialog open={openEditQuestion} onClose={() => !editingQ && setOpenEditQuestion(false)} fullWidth maxWidth="xs">
        <DialogTitle>Modifier la Question</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Input 
              label="Intitulé" 
              value={editLabel} 
              onChange={(e) => setEditLabel(e.target.value)} 
            />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Type de question</Typography>
            <Select size="small" value={editType} onChange={(e) => setEditType(e.target.value)} sx={{ borderRadius: 2 }}>
               <MenuItem value="single">🎯 Choix unique (QCM)</MenuItem>
               <MenuItem value="multiple">✅ Choix multiples (QCM)</MenuItem>
               <MenuItem value="boolean">⚖️ Vrai / Faux</MenuItem>
            </Select>
            <Input 
              label="Temps (seconde)" 
              type="number" 
              inputProps={{ min: 5, max: 120 }}
              value={editTimer} 
              onChange={(e) => setEditTimer(Number(e.target.value))} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button label="Annuler" variant="text" onClick={() => setOpenEditQuestion(false)} disabled={editingQ} />
          <Button label="Enregistrer" onClick={handleUpdateQuestion} disabled={editingQ || !editLabel.trim()} />
        </DialogActions>
      </Dialog>

      <Dialog open={!!editChoiceId} onClose={() => !editingC && setEditChoiceId(null)} fullWidth maxWidth="xs">
        <DialogTitle>Modifier le Choix</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Input 
              label="Texte du choix" 
              value={editChoiceText} 
              onChange={(e) => setEditChoiceText(e.target.value)} 
              autoFocus
            />
            <Box display="flex" alignItems="center" gap={1}>
              <Checkbox checked={editChoiceCorrect} onChange={(e) => setEditChoiceCorrect(e.target.checked)} />
              <Typography>Est-ce la bonne réponse ?</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button label="Annuler" variant="text" onClick={() => setEditChoiceId(null)} disabled={editingC} />
          <Button label="Enregistrer" onClick={handleUpdateChoice} disabled={editingC || !editChoiceText.trim()} />
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
