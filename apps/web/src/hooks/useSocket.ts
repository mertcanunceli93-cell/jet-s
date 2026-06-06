import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../store/useAuth';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const s = io('http://localhost:4000');
    setSocket(s);

    if (user) {
      s.emit('join', user.id);
    }

    return () => {
      s.disconnect();
    };
  }, [user]);

  return socket;
};
