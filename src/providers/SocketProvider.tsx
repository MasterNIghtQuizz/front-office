'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useSocket } from '@/store/useSocket';
import { useSession } from '@/store/useSession';

interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: <T>(type: string, payload: T) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { connect, disconnect, isConnected, isConnecting, error, sendMessage } = useSocket();
  const { gameToken, participants, participantId } = useSession();

  useEffect(() => {
    const isGamePage = pathname?.startsWith('/game');
    
    if (isGamePage && gameToken) {
      if (!isConnected && !isConnecting) {
        const myNickname = participants.find(p => p.participant_id === participantId)?.nickname || 'Host';
        connect(myNickname);
      }
    } else if (pathname && !isGamePage) {
      if (isConnected || isConnecting) {
        disconnect();
      }
    }
  }, [gameToken, pathname, connect, disconnect, isConnected, isConnecting, participants, participantId]);

  return (
    <SocketContext.Provider value={{ isConnected, isConnecting, error, sendMessage }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};
