'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSocket } from '@/store/useSocket';
import { useAuth } from '@/store/useAuth';

interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  sendMessage: <T>(type: string, payload: T) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { connect, disconnect, isConnected, isConnecting, error, sendMessage } = useSocket();
  const { user, token } = useAuth();

  useEffect(() => {
    // Auto-connect when authenticated
    if (token && user && !isConnected && !isConnecting) {
      const name = user.nickname || user.email;
      console.log('SocketProvider: Auto-connecting user', name);
      connect(name);
    }

    // Auto-disconnect when unauthenticated
    if (!token && isConnected) {
      console.log('SocketProvider: Auto-disconnecting');
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      // We might want to keep the connection alive between page navigations (which is what store does)
      // but if the provider is at top level, unmount means app close or major layout change
    };
  }, [token, user?.nickname, connect, disconnect, isConnected, isConnecting]);

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
