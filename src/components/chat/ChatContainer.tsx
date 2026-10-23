import React, { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMessages, sendMessageStream } from '../../store/slices/chatSlice';

import ChatInput from './ChatInput';
import type { AttachmentData } from './ChatInput';

export const ChatContainer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeSessionId, messages, isStreaming } = useAppSelector((state) => state.chat);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeMessages = activeSessionId ? messages[activeSessionId] || [] : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeSessionId && !messages[activeSessionId]) {
      dispatch(fetchMessages(activeSessionId));
    }
  }, [activeSessionId, dispatch, messages]);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages, activeSessionId]);

  const handleSend = (text: string, attachment?: AttachmentData) => {
    if (!activeSessionId || isStreaming) return;

    // Send to Redux stream thunk
    dispatch(sendMessageStream({ 
      sessionId: activeSessionId, 
      prompt: text,
      attachment 
    }));
  };

  if (!activeSessionId) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">
        Select or create a chat session to start.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900 text-zinc-100 min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {activeMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-3xl rounded-2xl px-5 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-600 text-white rounded-br-none'
                  : 'bg-zinc-800 text-zinc-200 border border-zinc-700/50 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-amber-400 animate-pulse" />}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Standalone Modular ChatInput Component */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
};

export default ChatContainer;