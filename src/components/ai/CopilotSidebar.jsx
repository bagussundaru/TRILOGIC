import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bot, X, Send, Loader2, ChevronRight, ChevronLeft,
    Sparkles, FileText, AlertTriangle, TrendingUp,
    Users, CheckSquare, MessageSquare, Zap, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = 'http://103.189.234.15:3001/api';

// Context-aware quick actions based on current module
const CONTEXT_ACTIONS = {
    dashboard: [
        { id: 'summary', label: 'Portfolio Summary', icon: FileText, prompt: 'Generate an executive summary of the current portfolio status' },
        { id: 'risks', label: 'Top Risks', icon: AlertTriangle, prompt: 'What are the top 5 risks across all projects?' },
        { id: 'forecast', label: 'Forecast', icon: TrendingUp, prompt: 'Predict project completion dates based on current velocity' }
    ],
    projects: [
        { id: 'health', label: 'Health Analysis', icon: Sparkles, prompt: 'Analyze the health of the selected project' },
        { id: 'blockers', label: 'Find Blockers', icon: AlertTriangle, prompt: 'Identify potential blockers and dependencies' },
        { id: 'optimize', label: 'Optimize Schedule', icon: Zap, prompt: 'Suggest schedule optimizations' }
    ],
    resources: [
        { id: 'capacity', label: 'Capacity Analysis', icon: Users, prompt: 'Analyze team capacity and identify bottlenecks' },
        { id: 'skills', label: 'Skills Gap', icon: Lightbulb, prompt: 'Identify skills gaps in the current team' },
        { id: 'allocation', label: 'Rebalance', icon: CheckSquare, prompt: 'Suggest resource rebalancing across projects' }
    ],
    risks: [
        { id: 'mitigate', label: 'Mitigation Plans', icon: AlertTriangle, prompt: 'Suggest mitigation strategies for high-priority risks' },
        { id: 'similar', label: 'Similar Risks', icon: Sparkles, prompt: 'Find similar risks from past projects' },
        { id: 'monte', label: 'Monte Carlo', icon: TrendingUp, prompt: 'Run Monte Carlo simulation for schedule risk' }
    ]
};

export default function CopilotSidebar({
    isOpen = true,
    onToggle,
    currentModule = 'dashboard',
    contextData = null
}) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Halo ${user?.full_name || 'User'}! 👋 Saya PMO Copilot Anda. Saya dapat membantu Anda dengan analisis proyek, identifikasi risiko, dan rekomendasi strategis. Apa yang ingin Anda ketahui?`
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const contextActions = CONTEXT_ACTIONS[currentModule] || CONTEXT_ACTIONS.dashboard;

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message to AI
    const sendMessage = useCallback(async (text) => {
        if (!text.trim() || isLoading) return;

        const userMessage = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const token = localStorage.getItem('trilogic_token');
            const response = await fetch(`${API_BASE_URL}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({
                    message: text,
                    context: {
                        module: currentModule,
                        role: user?.role,
                        data: contextData
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: data.data.response
                }]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Maaf, terjadi kesalahan: ${error.message}. Silakan coba lagi.`,
                isError: true
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, currentModule, user, contextData]);

    // Handle quick action click
    const handleQuickAction = (action) => {
        sendMessage(action.prompt);
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    return (
        <>
            {/* Toggle Button (when closed) */}
            {!isOpen && (
                <motion.button
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    onClick={onToggle}
                    className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-teal-600 to-teal-500 text-white p-3 rounded-l-xl shadow-lg hover:from-teal-700 hover:to-teal-600 transition-all"
                >
                    <Bot className="w-5 h-5" />
                </motion.button>
            )}

            {/* Sidebar Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25 }}
                        className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-teal-500 text-white">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-white/20 rounded-lg">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-sm">PMO Copilot</h3>
                                    <p className="text-xs text-teal-100">AI-powered assistant</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onToggle}
                                className="text-white hover:bg-white/20"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Quick Actions */}
                        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Quick Actions</p>
                            <div className="flex flex-wrap gap-1">
                                {contextActions.map(action => (
                                    <button
                                        key={action.id}
                                        onClick={() => handleQuickAction(action)}
                                        disabled={isLoading}
                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-white border border-slate-200 rounded-full hover:border-teal-400 hover:bg-teal-50 transition-colors disabled:opacity-50"
                                    >
                                        <action.icon className="w-3 h-3 text-teal-600" />
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user'
                                                ? 'bg-teal-600 text-white rounded-br-sm'
                                                : msg.isError
                                                    ? 'bg-red-50 text-red-700 border border-red-200 rounded-bl-sm'
                                                    : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                                            }`}
                                    >
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                                            <span className="text-xs text-slate-500">Thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 bg-white">
                            <div className="flex gap-2">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    placeholder="Ask me anything..."
                                    disabled={isLoading}
                                    className="flex-1 rounded-xl text-sm"
                                />
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!inputValue.trim() || isLoading}
                                    className="rounded-xl bg-teal-600 hover:bg-teal-700"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2 text-center">
                                Powered by Nebius AI • Meta-Llama-3.1-70B
                            </p>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
