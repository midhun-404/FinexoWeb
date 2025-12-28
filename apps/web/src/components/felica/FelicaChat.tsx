import { useState, useRef, useEffect } from 'react';
import { felicaService, type ChatMessage } from '../../services/felica';
import { MessageSquare, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FelicaChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '1', text: "Hi! I'm Felica. content_copy How can I help you with your finances today?", isUser: false, timestamp: new Date() }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            text: input,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Prepare history for API
            const history = messages.map(m => ({ text: m.text, isUser: m.isUser }));

            const response = await felicaService.chat(userMsg.text, history);

            const botMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: response.response,
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error("Chat error", error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting right now. Please try again.",
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 md:w-96 rounded-2xl border border-gray-800 bg-[#1e1e1e] shadow-2xl overflow-hidden flex flex-col"
                        style={{ height: '500px' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-800 bg-[#252525] p-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/20 text-purple-400">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Felica AI</h3>
                                    <p className="text-xs text-gray-400">Personal Finance Assistant</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e1e1e]">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl p-3 text-sm ${msg.isUser
                                            ? 'bg-purple-600 text-white rounded-br-none'
                                            : 'bg-[#333] text-gray-200 rounded-bl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-[#333] rounded-2xl rounded-bl-none p-3 flex gap-1">
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="border-t border-gray-800 p-3 bg-[#252525]">
                            <form onSubmit={handleSend} className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Message Felica..."
                                    className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="p-2 text-purple-400 hover:text-purple-300 disabled:opacity-50 transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-colors ${isOpen ? 'bg-gray-700 text-gray-400' : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    }`}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </motion.button>
        </div>
    );
};
