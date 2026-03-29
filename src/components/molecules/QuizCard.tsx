'use client';

import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface QuizCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ title, description, onClick }) => {
  return (
    <Card 
      onClick={onClick} 
      sx={{ 
        mb: 2, 
        cursor: 'pointer', 
        transition: '0.2s', 
        '&:hover': { transform: 'translateY(-2px)' }
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" flexDirection="column">
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {description}
          </Typography>
        </Box>
        <ChevronRightIcon color="disabled" />
      </CardContent>
    </Card>
  );
};
