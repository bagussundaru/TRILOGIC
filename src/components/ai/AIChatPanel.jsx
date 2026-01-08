import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aiAPI } from '@/api/apiClient';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  Lightbulb,
  BarChart3,
  FileText,
  AlertTriangle,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AIChatPanel({ implementations = [], tasks = [], risks = [] }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🤖 Halo! Saya **AI Assistant** berbasis Nebius (Meta-Llama-3.1-70B) untuk Smart TRILOGIC.\n\nSaya bisa membantu Anda:\n• Menganalisis status portfolio proyek\n• Memberikan insight dan rekomendasi\n• Menjawab pertanyaan seputar PMO\n• Membuat ringkasan eksekutif\n\nSilakan tanya apa saja!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const scrollRef = useRef(null);

  const quickPrompts = [
    { icon: BarChart3, text: 'Status Portfolio', prompt: 'Berikan analisis singkat tentang status portfolio proyek saat ini' },
    { icon: AlertTriangle, text: 'Proyek Berisiko', prompt: 'Proyek mana yang berisiko tinggi dan butuh perhatian segera?' },
    { icon: FileText, text: 'Ringkasan Eksekutif', prompt: 'Buat ringkasan eksekutif untuk CEO meeting' },
    { icon: Lightbulb, text: 'Rekomendasi', prompt: 'Berikan rekomendasi prioritas action items untuk minggu ini' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check API connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://103.189.234.15:3001/api/health');
        setIsOnline(response.ok);
      } catch (error) {
        setIsOnline(false);
      }
    };
    checkConnection();
  }, []);

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Build chat history for context
      const history = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      // Call Nebius AI via backend
      const response = await aiAPI.chat(messageText, history);

      const assistantMessage = {
        role: 'assistant',
        content: response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);

      // Fallback message
      const errorMessage = {
        role: 'assistant',
        content: `⚠️ **Error:** ${error.message}\n\nPastikan backend server running di \`http://localhost:3001\`\n\nJalankan:\n\`\`\`bash\ncd server && npm run dev\n\`\`\``
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <Card className="border border-[#f0f2f5] shadow-[0_1px_3px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300 h-full flex flex-col rounded-xl overflow-hidden">
      <CardHeader className="pb-3 border-b border-[#f0f2f5] bg-gradient-to-r from-teal-50/50 to-cyan-50/50">
        <CardTitle className="text-lg font-bold text-[#1a1a1a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span>AI Assistant</span>
              <p className="text-[10px] font-normal text-[#888] mt-0.5">Powered by Nebius AI</p>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Bot className="w-4 h-4 text-teal-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.role === 'user'
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                      : 'bg-[#f5f5f5] text-[#1a1a1a] border border-[#e5e5e5]'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="bg-[#f5f5f5] rounded-2xl px-4 py-3 border border-[#e5e5e5]">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                    <span className="text-sm text-[#666]">AI sedang berpikir...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 pb-3 border-t border-[#f0f2f5] pt-3">
            <p className="text-[11px] text-[#888] mb-2 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Pertanyaan cepat:
            </p>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-[11px] h-7 rounded-lg border-[#e5e5e5] hover:border-teal-300 hover:bg-teal-50 transition-colors"
                  onClick={() => sendMessage(prompt.prompt)}
                  disabled={isLoading || !isOnline}
                >
                  <prompt.icon className="w-3 h-3 mr-1.5 text-teal-600" />
                  {prompt.text}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-[#f0f2f5] bg-[#fafafa]">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isOnline ? "Tanya sesuatu tentang proyek..." : "Backend offline..."}
              disabled={isLoading || !isOnline}
              className="flex-1 border-[#e5e5e5] focus:border-teal-400 rounded-xl"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim() || !isOnline}
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}