import { useState, useRef, useEffect } from 'react';
import { felicaService } from '../../services/felica';
import type { ChatMessage } from '../../services/felica';
import { X, Send, Sparkles } from 'lucide-react';

export const FelicaChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [history, setHistory] = useState<ChatMessage[]>([
        { id: '1', text: "Hi! I'm Felica. Ask me anything about your finances.", isUser: false, timestamp: Date.now() }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), text: input, isUser: true, timestamp: Date.now() };
        setHistory(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await felicaService.chat(userMsg.text, history);
            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), text: response.response, isUser: false, timestamp: Date.now() };
            setHistory(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error(err);
            setHistory(prev => [...prev, { id: (Date.now() + 1).toString(), text: "I'm having trouble connecting. Please try again.", isUser: false, timestamp: Date.now() }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {isOpen && (
                <div className="mb-4 w-80 md:w-96 rounded-2xl border border-gray-700 bg-[#1e1e1e] shadow-2xl overflow-hidden flex flex-col h-[500px] transition-all animate-in slide-in-from-bottom-10 fade-in duration-200">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-700 to-indigo-800 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                            <Sparkles className="h-5 w-5" />
                            <span className="font-bold">Chat with Felica</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Chat Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#121212]">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-xl px-4 py-2 text-sm ${msg.isUser
                                    ? 'bg-purple-600 text-white rounded-br-none'
                                    : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                                    }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 rounded-xl px-4 py-2 rounded-bl-none border border-gray-700 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-[#1e1e1e] border-t border-gray-700">
                        <div className="flex gap-2">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className="flex-1 bg-black/30 border border-gray-600 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading}
                                className="p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group h-14 w-14 rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/40 hover:scale-110 transition-all duration-200"
            >
                {isOpen ? <X className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white group-hover:rotate-12 transition-transform" />}
            </button>
        </div>
    );
};
