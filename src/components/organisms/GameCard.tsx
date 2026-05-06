'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';
import { Question } from '@/types';
import { Button } from '@/components/atoms/Button';
import { useSession } from '@/store/useSession';
import { BuzzerButton } from '@/components/atoms/BuzzerButton';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';

interface GameCardProps {
  question: Question;
  onSubmit: (choiceIds: string[]) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ question, onSubmit }) => {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const { role, answerBuzzer } = useSession();
  const activatedAt = useSession(state => state.activatedAt);

  // Precision timer state
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!activatedAt) return question.timer_seconds;
    const now = Date.now();
    const serverStart = activatedAt > 1000000000000 ? activatedAt : activatedAt * 1000;
    const elapsed = Math.floor((now - serverStart) / 1000);
    return Math.max(0, question.timer_seconds - elapsed);
  });

  const hasAnswered = useSession(state => state.hasAnswered);

  const isModerator = role === 'moderator';
  const isTimeUp = timeLeft <= 0;

  useEffect(() => {
    const tick = () => {
      if (!activatedAt) {
        setTimeLeft(question.timer_seconds);
        return;
      }

      const now = Date.now();
      const serverStart = activatedAt > 1000000000000 ? activatedAt : activatedAt * 1000;
      const elapsed = Math.floor((now - serverStart) / 1000);
      const remaining = Math.max(0, question.timer_seconds - elapsed);

      setTimeLeft(remaining);
    };

    tick();
    const interval = setInterval(tick, 500);
    return () => clearInterval(interval);
  }, [activatedAt, question.timer_seconds]);

  const CHOICE_COLORS = [
    { bg: '#FF4B5C', hover: '#FF3145' },
    { bg: '#4592FF', hover: '#3185FF' },
    { bg: '#FFC845', hover: '#FFBD2E' },
    { bg: '#28D07C', hover: '#21B36A' },
    { bg: '#9145FF', hover: '#7A2EFF' },
    { bg: '#FF45D8', hover: '#FF2EB8' },
    { bg: '#FF8D45', hover: '#FF721F' },
    { bg: '#28D0C5', hover: '#21B3A9' },
  ];


  const toggleChoice = (choiceId: string) => {
    if (hasAnswered || isTimeUp || isModerator) return;

    if (question.type === 'multiple') {
      setSelectedChoices(prev =>
        prev.includes(choiceId) ? prev.filter(id => id !== choiceId) : [...prev, choiceId]
      );
    } else {
      setSelectedChoices([choiceId]);
    }
  };

  const handleManualSubmit = () => {
    if (selectedChoices.length > 0 && !hasAnswered && !isTimeUp) {
      onSubmit(selectedChoices);
    }
  };

  const progress = (timeLeft / question.timer_seconds) * 100;

  return (
    <Box
      className="animate-up"
      sx={{
        width: '100%',
        maxWidth: 800,
        mx: 'auto',
        position: 'relative'
      }}
    >
      <Fade in={isTimeUp && !isModerator}>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 100,
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--border-radius-md)',
            border: 'var(--border-thick)',
            pointerEvents: 'auto'
          }}
        >
          <Typography
            variant="h2"
            fontWeight={1000}
            sx={{
              color: 'black',
              letterSpacing: -4,
              textTransform: 'uppercase',
              transform: 'rotate(-5deg)',
              textAlign: 'center',
              px: 4
            }}
          >
            TEMPS<br />TERMINÉ !
          </Typography>
        </Box>
      </Fade>

      <Paper
        sx={{
          p: { xs: 3, sm: 6 },
          borderRadius: 'var(--border-radius-md)',
          bgcolor: 'white',
          border: 'var(--border-thick)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0px 20px 0px rgba(0,0,0,0.05)'
        }}
      >
        {/* Animated Progress Bar */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 12,
            width: `${progress}%`,
            bgcolor: timeLeft < 5 ? '#FF4B5C' : 'black',
            transition: 'width 0.5s linear, background-color 0.3s'
          }}
        />

        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={6} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="overline" sx={{ fontWeight: 1000, color: 'rgba(0,0,0,0.5)', letterSpacing: 2 }}>
              {question.type === 'multiple' ? 'PLUSIEURS RÉPONSES' : question.type === 'buzzer' ? 'MODE BUZZER' : 'RÉPONSE UNIQUE'}
            </Typography>
            <Typography variant="h3" fontWeight={1000} sx={{ letterSpacing: -2, mt: 1, lineHeight: 1, color: 'black' }}>
              {question.label}
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: timeLeft < 5 ? '#FF4B5C' : 'black',
              color: 'white',
              px: 3,
              py: 2,
              borderRadius: 'var(--border-radius-sm)',
              fontWeight: 1000,
              fontSize: '2rem',
              minWidth: '90px',
              textAlign: 'center',
              border: '4px solid black',
              boxShadow: 'var(--shadow-main)'
            }}
          >
            {Math.ceil(timeLeft)}
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 3 }}>
          {question.type !== 'buzzer' ? (
            question.choices?.map((choice, index) => {
              const color = CHOICE_COLORS[index % CHOICE_COLORS.length];
              const isSelected = selectedChoices.includes(choice.id);

              return (
                <Box
                  key={choice.id}
                  onClick={() => toggleChoice(choice.id)}
                  sx={{
                    p: 4,
                    borderRadius: 'var(--border-radius-sm)',
                    border: 'var(--border-thick)',
                    cursor: (isTimeUp || isModerator || hasAnswered) ? 'default' : 'pointer',
                    bgcolor: isSelected ? 'black' : color.bg,
                    color: 'white',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    position: 'relative',
                    '&:hover': {
                      transform: (isTimeUp || isModerator || hasAnswered) ? 'none' : 'translateY(-6px)',
                      boxShadow: (isTimeUp || isModerator || hasAnswered) ? 'none' : `0px 10px 0px ${isSelected ? '#333' : color.hover}`,
                      bgcolor: isSelected ? 'black' : color.hover
                    },
                    '&:active': {
                      transform: 'translateY(0px)',
                      boxShadow: 'none'
                    },
                    opacity: (isTimeUp && !isSelected) ? 0.3 : 1
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '8px',
                      border: '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {isSelected && (
                      <Box sx={{ width: 16, height: 16, bgcolor: 'white', borderRadius: '4px' }} />
                    )}
                  </Box>
                  <Typography fontWeight={1000} fontSize="1.3rem" sx={{ letterSpacing: -0.5, textTransform: 'uppercase' }}>
                    {choice.text}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Box sx={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
              {question.current_buzzer ? (
                <Fade in={true}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" fontWeight={1000} sx={{ mb: 4, letterSpacing: -1, textTransform: 'uppercase' }}>
                      ⚡️ {question.current_buzzer.username} A BUZZÉ !
                    </Typography>
                    
                    {isModerator && (
                      <Box display="flex" gap={3} justifyContent="center">
                        <Button 
                          label="CORRECT" 
                          startIcon={<CheckIcon />}
                          onClick={() => answerBuzzer(question.current_buzzer!.id, true)}
                          sx={{ 
                            bgcolor: '#28D07C', 
                            color: 'black', 
                            px: 4, 
                            py: 2, 
                            borderRadius: 'var(--border-radius-sm)',
                            border: 'var(--border-thick)',
                            fontWeight: 1000
                          }} 
                        />
                        <Button 
                          label="INCORRECT" 
                          startIcon={<CloseIcon />}
                          onClick={() => answerBuzzer(question.current_buzzer!.id, false)}
                          sx={{ 
                            bgcolor: '#FF4B5C', 
                            color: 'white', 
                            px: 4, 
                            py: 2, 
                            borderRadius: 'var(--border-radius-sm)',
                            border: 'var(--border-thick)',
                            fontWeight: 1000
                          }} 
                        />
                      </Box>
                    )}
                  </Box>
                </Fade>
              ) : (
                !isModerator && (
                  <BuzzerButton 
                    onClick={() => onSubmit([])} 
                    disabled={hasAnswered || isTimeUp} 
                  />
                )
              )}
              
              {isModerator && !question.current_buzzer && (
                <Typography variant="h5" fontWeight={1000} sx={{ opacity: 0.5 }}>
                  EN ATTENTE D'UN BUZZER...
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {!isModerator && question.type !== 'buzzer' && (
          <Box mt={10} display="flex" justifyContent="center">
            <Button
              label={hasAnswered ? "BIEN REÇU !" : "VALIDER MA RÉPONSE"}
              disabled={hasAnswered || selectedChoices.length === 0 || isTimeUp}
              onClick={handleManualSubmit}
              sx={{
                px: 12,
                py: 3,
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 1000,
                fontSize: '1.4rem',
                backgroundColor: hasAnswered ? '#4CAF50 !important' : 'black',
                color: 'white',
                border: 'var(--border-thick)',
                '&:hover': {
                  transform: 'scale(1.05)',
                  boxShadow: 'var(--shadow-main)'
                },
                '&:disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }
              }}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

