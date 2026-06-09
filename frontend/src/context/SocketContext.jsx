import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const url = import.meta.env.VITE_API_URL || window.location.origin;
    const s = io(url, { transports: ['websocket', 'polling'] });
    setSocket(s);

    const joinRoom = () => {
      const userId = localStorage.getItem('userId');
      if (userId) s.emit('join', userId);
    };
    joinRoom();
    window.addEventListener('foodlink-auth', joinRoom);

    return () => {
      window.removeEventListener('foodlink-auth', joinRoom);
      s.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
