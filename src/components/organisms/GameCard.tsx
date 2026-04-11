'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Question } from '@/types';
import { ChoiceButton } from '@/components/atoms/ChoiceButton';
import { BuzzerButton } from '@/components/atoms/BuzzerButton';
import TimerIcon from '@mui/icons-material/Timer';
import { useSession } from '@/store/useSession';

interface GameCardProps {
  question: Question;
  onSubmit: (choiceIds: string[]) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ question, onSubmit }) => {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(question.timer_seconds);
  const [hasSubmitted, setHasSubmitted] = useState(false);


  const { role } = useSession();
  const isModerator = role === 'moderator';

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const toggleChoice = (id: string) => {
    if (hasSubmitted || timeLeft <= 0 || isModerator) return;

    if (question.type === 'single' || question.type === 'boolean') {
      setSelectedChoices([id]);
      setHasSubmitted(true);
      onSubmit([id]);
    } else {
      const newSelection = selectedChoices.includes(id)
        ? selectedChoices.filter((cid) => cid !== id)
        : [...selectedChoices, id];
      setSelectedChoices(newSelection);
    }
  };

  const timerProgress = (timeLeft / question.timer_seconds) * 100;

  if (question.type === 'buzzer') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" gap={4} py={8}>
        <Typography variant="h3" fontWeight={1000} textAlign="center" gutterBottom>
          {question.label.toUpperCase()}
        </Typography>
        {!isModerator ? (
          <BuzzerButton disabled={timeLeft <= 0} onClick={() => alert('BUZZ !')} />
        ) : (
          <Typography variant="h5" color="text.secondary">Mode Moderateur - Attente des joueurs...</Typography>
        )}
        {timeLeft <= 0 && (
          <Typography variant="h5" color="error" fontWeight={1000}>
            TEMPS ÉCOULÉ !
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box className="animate-up" sx={{ maxWidth: 840, width: '100%', mx: 'auto' }}>
      <Box
        sx={{
          height: 12,
          width: '100%',
          border: 'var(--border-main)',
          mb: 4,
          background: 'white',
          borderRadius: 'var(--border-radius-sm)',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${timerProgress}%`,
            background: timeLeft < 5 ? 'var(--error)' : 'black',
            transition: 'width 1s linear'
          }}
        />
      </Box>

      <Box
        sx={{
          background: 'white',
          borderRadius: 'var(--border-radius-md)',
          p: { xs: 4, md: 6 },
          border: 'var(--border-thick)',
          position: 'relative'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
          <Box
            sx={{
              border: 'var(--border-main)',
              px: 2,
              py: 0.5,
              borderRadius: 'var(--border-radius-sm)',
              background: 'white',
              fontWeight: 1000,
              fontSize: '0.75rem'
            }}
          >
            {question.type.split('_').join(' ').toUpperCase()}
          </Box>
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              border: 'var(--border-main)',
              background: timeLeft < 5 ? '#FFE5E5' : 'white',
              px: 2,
              py: 0.5,
              borderRadius: 'var(--border-radius-sm)',
              color: 'black',
            }}
          >
            <TimerIcon fontSize="small" />
            <Typography variant="subtitle1" fontWeight={1000}>{timeLeft}S</Typography>
          </Box>
        </Box>

        <Typography variant="h3" fontWeight={1000} mb={isModerator ? 0 : 6} sx={{ lineHeight: 1.1, letterSpacing: -2 }}>
          {question.label.toUpperCase()}
        </Typography>

        {isModerator ? (
          <Box
            sx={{
              mt: 4,
              p: 3,
              border: 'var(--border-main)',
              borderRadius: 'var(--border-radius-sm)',
              background: '#f9f9f9',
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              👁️ MODE MODÉRATEUR : VOUS NE POUVEZ PAS RÉPONDRE
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Les joueurs voient les options sur leur écran.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {question.choices?.map((choice, idx) => (
              <Grid size={{ xs: 12, sm: 6 }} key={choice.id}>
                <ChoiceButton
                  index={idx}
                  text={choice.text}
                  selected={selectedChoices.includes(choice.id)}
                  onClick={() => toggleChoice(choice.id)}
                  disabled={hasSubmitted || timeLeft <= 0}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {!isModerator && question.type === 'multiple' && !hasSubmitted && timeLeft > 0 && (
          <Box mt={6} display="flex" justifyContent="center">
            <button
              onClick={() => { setHasSubmitted(true); onSubmit(selectedChoices); }}
              style={{
                background: 'black',
                color: 'white',
                border: 'var(--border-main)',
                padding: '16px 56px',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '18px',
                fontWeight: 1000,
                cursor: 'pointer',
              }}
            >
              VALIDER MES RÉPONSES
            </button>
          </Box>
        )}
      </Box>
    </Box>
  );
};
