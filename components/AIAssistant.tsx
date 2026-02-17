
import React, { useState, useRef, useEffect } from 'react';
import { AppState } from '../types';
import { processAICommand } from '../services/geminiService';

interface AIAssistantProps {
  state: AppState;
  onAction: (action: string, data: any) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ state, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Olá! Sou o **Açaí Manager AI**. Como posso ajudar na gestão hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    const result = await processAICommand(userMsg, state);
    
    setMessages(prev => [...prev, { role: 'ai', text: result.message }]);
    setIsLoading(false);

    if (result.action && result.action !== 'CHAT_ONLY') {
      onAction(result.action, result.data);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-purple-600 text-white rounded-none shadow-2xl flex items-center justify-center text-2xl hover:bg-purple-700 transition-all hover:scale-110 z-50"
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'}`}></i>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] h-[500px] bg-white rounded-none shadow-2xl border border-slate-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-4 bg-purple-600 rounded-none text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-none flex items-center justify-center">
               <i className="fas fa-magic text-sm"></i>
            </div>
            <div>
               <h3 className="font-bold text-sm">Açaí Manager AI</h3>
               <p className="text-[10px] text-purple-100">Inteligência Artificial Ativa</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-none text-sm ${
                  m.role === 'user' 
                    ? 'bg-purple-100 text-purple-900' 
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 p-3 rounded-none">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-none animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-none animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-none animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 flex gap-2">
            <input
              type="text"
              placeholder="Pergunte algo..."
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-none text-sm outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="bg-purple-600 text-white w-10 h-10 rounded-none flex items-center justify-center hover:bg-purple-700 transition-colors">
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </>
  );
};
