import React, { useState, useRef } from 'react';
import { Paperclip, X, Image as ImageIcon } from 'lucide-react';

export interface AttachmentData {
  type: 'image' | 'text';
  data: string; // Base64 data URL for images, raw text string for documents
  name: string;
}

interface ChatInputProps {
  onSend: (text: string, attachment?: AttachmentData) => void;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<AttachmentData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = () => {
        setAttachment({
          type: 'image',
          data: reader.result as string, // Base64 Data URL
          name: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text, logs, JSON, markdown, or code files
      reader.onload = () => {
        setAttachment({
          type: 'text',
          data: reader.result as string,
          name: file.name,
        });
      };
      reader.readAsText(file);
    }

    // Reset input value so the same file can be selected again if removed
    e.target.value = '';
  };

  const handleSend = () => {
    if ((!text.trim() && !attachment) || disabled) return;

    onSend(text, attachment || undefined);

    // Reset input state
    setText('');
    setAttachment(null);
  };

  return (
    <div className="p-4 border-t border-zinc-800 bg-zinc-950">
      <div className="max-w-4xl mx-auto flex flex-col bg-zinc-900 border border-zinc-700/60 rounded-xl p-3 focus-within:border-amber-500/80 transition-colors">
        
        {/* Attachment In-Memory Preview Badge */}
        {attachment && (
          <div className="flex items-center gap-2 mb-2 p-1.5 px-3 bg-zinc-800 rounded-lg w-fit border border-zinc-700">
            {attachment.type === 'image' ? (
              <img src={attachment.data} alt="attachment preview" className="w-8 h-8 object-cover rounded" />
            ) : (
              <ImageIcon className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-xs text-zinc-200 truncate max-w-[200px]">{attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="p-1 hover:text-rose-400 text-zinc-400 transition-colors ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Text Input & Controls */}
        <div className="flex gap-3 items-end">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg hover:bg-zinc-800"
            title="Attach image or code/text document"
            disabled={disabled}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.txt,.md,.json,.py,.js,.ts,.tsx,.css,.html,.log"
            onChange={handleFileChange}
            className="hidden"
          />

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Reply to Gemma 4..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-zinc-100 placeholder-zinc-500 max-h-48 text-sm"
            disabled={disabled}
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || (!text.trim() && !attachment)}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 disabled:opacity-40 transition-all text-xs font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;