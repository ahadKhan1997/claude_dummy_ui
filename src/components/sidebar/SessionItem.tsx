import React from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type{ ChatSession } from '../../types/chat';

interface Props {
  session: ChatSession;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SessionItem: React.FC<Props> = ({ session, isActive, onSelect, onDelete }) => (
  <div
    onClick={() => onSelect(session.id)}
    className={`group flex items-center justify-between px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${
      isActive ? 'bg-zinc-800 text-zinc-100 font-medium' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
    }`}
  >
    <div className="flex items-center gap-2.5 truncate">
      <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
      <span className="truncate">{session.title}</span>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation();
        onDelete(session.id);
      }}
      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-zinc-500 transition-all"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);