import React, { useEffect } from 'react';
import { useAppDispatch } from './store/hooks';
import { fetchSessions } from './store/slices/chatSlice';
import { Sidebar } from './components/layout/Sidebar';
import { ChatContainer } from './components/chat/ChatContainer';

export const App: React.FC = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  return (
    <div className="flex h-screen w-screen bg-zinc-900 text-zinc-100 overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 h-full">
        <ChatContainer />
      </main>
    </div>
  );
};

export default App;