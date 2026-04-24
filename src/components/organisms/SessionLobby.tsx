'use client';

import React from 'react';
import { Box, Typography, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Button } from '../atoms/Button';

interface SessionLobbyProps {
  publicKey: string;
  participants: Array<{ participant_id: string; nickname: string; role: string }>;
  participantId?: string | null;
  isModerator?: boolean;
}

export const SessionLobby: React.FC<SessionLobbyProps> = ({ publicKey, participants, participantId }) => {
  const [copied, setCopied] = React.useState(false);
  const [showQr, setShowQr] = React.useState(false);

  const handleCopy = () => {
    if (!publicKey) return;
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/join?code=${publicKey}`
    : '';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(joinUrl)}`;

  const myName = participants.find(p => p.participant_id === participantId)?.nickname || 'VOUS';

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={6} py={4}>
      <Box
        className="animate-up"
        sx={{
          textAlign: 'center',
          width: '100%',
          maxWidth: 480,
          background: 'white',
          borderRadius: 'var(--border-radius-md)',
          p: 6,
          border: 'var(--border-thick)',
          position: 'relative'
        }}
      >
        <Box 
          sx={{ 
            position: 'absolute', 
            top: -20, 
            left: '50%', 
            transform: 'translateX(-50%)',
            background: 'black',
            color: 'white',
            px: 3,
            py: 1,
            borderRadius: 'var(--border-radius-sm)',
            border: 'var(--border-main)',
            whiteSpace: 'nowrap',
            fontWeight: 1000,
            fontSize: '0.8rem',
            zIndex: 10
          }}
        >
          CONNECTÉ : {myName.toUpperCase()}
        </Box>

        <Typography 
          variant="overline" 
          sx={{ 
            color: 'var(--text-primary)', 
            fontWeight: 1000, 
            letterSpacing: 2,
            display: 'block',
            mb: 1
          }}
        >
          SESSION EN DIRECT
        </Typography>
        
        <Typography 
          variant="h2" 
          fontWeight={1000} 
          sx={{ 
            letterSpacing: -2, 
            my: 2, 
            color: 'var(--text-primary)',
            fontSize: { xs: '3rem', sm: '4rem' }
          }}
        >
          {publicKey}
        </Typography>

        <Box display="flex" justifyContent="center" gap={2} mt={4}>
          <Button 
            label={copied ? "COPIÉ !" : "COPIER LE CODE"} 
            variant="contained" 
            size="medium" 
            onClick={handleCopy}
            sx={{ 
              borderRadius: 'var(--border-radius-sm)',
              background: copied ? 'black' : 'white',
              color: copied ? 'white' : 'black',
              fontWeight: 900,
              px: 4,
              border: 'var(--border-main)',
              transition: 'all 0.2s',
              '&:hover': {
                background: copied ? 'black' : '#f0f0f0',
                border: 'var(--border-main)',
              }
            }} 
          />
          <Button 
            label="QR Code" 
            variant="contained" 
            size="medium" 
            onClick={() => setShowQr(true)}
            sx={{ 
              borderRadius: 'var(--border-radius-sm)',
              background: 'black',
              color: 'white',
              fontWeight: 900,
              px: 4,
              border: 'var(--border-main)',
              '&:hover': {
                background: '#333',
              }
            }} 
          />
        </Box>
      </Box>

      <Dialog 
        open={showQr} 
        onClose={() => setShowQr(false)}
        PaperProps={{
          sx: {
            borderRadius: 'var(--border-radius-md)',
            border: 'var(--border-thick)',
            p: 2,
            textAlign: 'center'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 1000, letterSpacing: -1 }}>REJOINDRE LA PARTIE</DialogTitle>
        <DialogContent>
          <Box 
            component="img" 
            src={qrImageUrl} 
            alt="Session QR Code"
            sx={{ 
              width: 250, 
              height: 250, 
              border: 'var(--border-main)', 
              p: 1, 
              bgcolor: 'white',
              mb: 2
            }}
          />
          <Typography variant="body2" sx={{ fontWeight: 800, textTransform: 'uppercase', opacity: 0.7 }}>
            Scanner pour rejoindre directement
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            label="FERMER" 
            onClick={() => setShowQr(false)} 
            sx={{ background: 'black', color: 'white' }}
          />
        </DialogActions>
      </Dialog>

      <Box width="100%" maxWidth={700} className="animate-up" sx={{ animationDelay: '0.1s' }}>
        <Box display="flex" justifyContent="center" alignItems="center" mb={5} gap={2}>
          <Box 
            sx={{ 
              background: 'black',
              width: 50,
              height: 50,
              borderRadius: 'var(--border-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              border: 'var(--border-main)'
            }}
          >
            <Typography variant="h5" fontWeight={1000}>{participants.length}</Typography>
          </Box>
          <Typography variant="h5" fontWeight={1000} color="var(--text-primary)" sx={{ letterSpacing: -1 }}>
            JOUEURS CONNECTÉS
          </Typography>
        </Box>

        <Box display="flex" flexWrap="wrap" justifyContent="center" gap={2}>
          {participants.map((p) => (
            <Box
              key={p.participant_id}
              sx={{
                px: 3,
                py: 1.5,
                borderRadius: 'var(--border-radius-sm)',
                backgroundColor: p.participant_id === participantId ? 'black' : 'white',
                color: p.participant_id === participantId ? 'white' : 'black',
                border: 'var(--border-main)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.3s ease'
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  background: p.participant_id === participantId ? 'white' : 'black', 
                  color: p.participant_id === participantId ? 'black' : 'white',
                  fontSize: '0.8rem', 
                  fontWeight: 1000,
                  borderRadius: 'var(--border-radius-sm)'
                }}
              >
                {p.nickname.substring(0, 2).toUpperCase()}
              </Avatar>
              <Typography fontWeight={1000}>
                {p.nickname.toUpperCase()} {p.participant_id === participantId && '(VOUS)'}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
