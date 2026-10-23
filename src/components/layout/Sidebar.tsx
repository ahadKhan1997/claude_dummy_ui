import React from 'react';
import { Plus, Sparkles, Bot } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { createNewSession, setActiveSession } from '../../store/slices/chatSlice';
import { SessionItem } from '../sidebar/SessionItem';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sessions, activeSessionId } = useAppSelector((state) => state.chat);

  const handleNewChat = async () => {
    try {
      // Dispatch create new session thunk
      const resultAction = await dispatch(createNewSession({ title: 'New Chat' })).unwrap();
      if (resultAction?.id) {
        dispatch(setActiveSession(resultAction.id));
      }
    } catch (err) {
      console.error('Failed to create new chat session:', err);
    }
  };

  return (
    <aside className="w-64 h-full bg-zinc-950 border-r border-zinc-800/80 flex flex-col justify-between">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="p-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm text-zinc-100">Claude Gemma</span>
        </div>

        <div className="px-3 pb-3">
          <button
            onClick={handleNewChat}
            className="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            New Chat
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {sessions.map((session) => (
            <SessionItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onSelect={(id) => dispatch(setActiveSession(id))}
              onDelete={(id) => dispatch(deleteSession(id))}
            />
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-zinc-800/80">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-800/50">
          <Bot className="w-4 h-4 text-amber-500" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-300">Gemma 4</span>
            <span className="text-[10px] text-zinc-500">Local Ollama Engine</span>
          </div>
        </div>
      </div>
    </aside>
  );
};