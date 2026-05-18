'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/auth-context';
import { apiClient } from '@/lib/api-client';
import { 
  Bot, 
  Send, 
  Sparkles, 
  TrendingUp, 
  Leaf, 
  BarChart3, 
  Info,
  ChevronRight,
  MessageSquare,
  Zap,
  Globe,
  Database,
  Search,
  RefreshCcw,
  // Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  contextSource?: 'vector' | 'business' | 'general';
}

const SUGGESTIONS = [
  "What are my top selling items?",
  "Analyze current fertilizer market trends.",
  "Which products are low in stock?",
  "Give me advice on seasonal crop pricing.",
  "Summarize my recent sales performance."
];

export default function AiAssistantPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello **${user?.name || 'Sovereign Seller'}**! I'm your **AgriQon AI Intelligence Hub**. \n\nI have synchronized with your real-time inventory and global agricultural market feeds. How can I assist your business growth today?`,
      timestamp: new Date(),
      contextSource: 'business'
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (customPrompt?: string) => {
    const promptValue = customPrompt || input;
    if (!promptValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: promptValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await apiClient.generateAiChat(promptValue);
      
      const responseData = response.data as unknown;
      
      let content = '';
      let rawSource = 'business';
      
      if (typeof responseData === 'string') {
        content = responseData;
      } else if (responseData && typeof responseData === 'object') {
        const dataObj = responseData as Record<string, unknown>;
        content = typeof dataObj.content === 'string' ? dataObj.content : '';
        rawSource = typeof dataObj.source === 'string' ? dataObj.source : 'business';
      }
      
      let source: 'vector' | 'business' | 'general' = 'business';
      if (rawSource === 'vector-search' || rawSource === 'vector') {
        source = 'vector';
      } else if (rawSource === 'business-info' || rawSource === 'business') {
        source = 'business';
      } else {
        source = 'general';
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
        timestamp: new Date(),
        contextSource: source,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting to the network. Please check your connection or try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const insights = [
    {
      title: "Market Demand",
      value: "+12.4%",
      description: "Organic fertilizers are seeing a surge in your region.",
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10"
    },
    {
      title: "Price Forecast",
      value: "Stable",
      description: "Grain prices expected to hold steady for the next quarter.",
      icon: BarChart3,
      color: "text-blue-400",
      bg: "bg-blue-400/10"
    },
    {
      title: "Optimizing Strategy",
      value: "Action Needed",
      description: "Re-list your seasonal seeds to capture early planters.",
      icon: Zap,
      color: "text-amber-400",
      bg: "bg-amber-400/10"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-indigo-500/30 overflow-hidden">
      {/* Premium Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/15 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[140px] animate-pulse [animation-delay:2s]" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/10 rounded-full blur-[120px]" />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 h-screen flex flex-col">
        
        <header className="flex items-center justify-between mb-8 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">AI Business Intelligence</h1>
              <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] font-black text-indigo-400/80 mt-1">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                <span>Neural Market Analysis Active</span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md">
            <div className="flex -space-x-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                <Globe className="w-3 h-3 text-emerald-400" />
              </div>
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                <Database className="w-3 h-3 text-indigo-400" />
              </div>
            </div>
            <span className="text-[11px] font-medium text-white/60 uppercase tracking-wider pl-2">Hybrid Knowledge Engine</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
          
          {/* Left Column: Stats & Insights */}
          <div className="lg:col-span-3 space-y-6 overflow-y-auto pr-2 custom-scrollbar hidden lg:block">
            <h2 className="text-sm font-bold uppercase tracking-widest text-white/30 mb-4 px-1">Market Signals</h2>
            
            {insights.map((insight, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-indigo-500/40 transition-all cursor-default backdrop-blur-md relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-3xl transition-colors group-hover:bg-indigo-500/10" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-xl ${insight.bg}`}>
                      <insight.icon className={`w-5 h-5 ${insight.color}`} />
                    </div>
                    <span className="text-lg font-black text-white">{insight.value}</span>
                  </div>
                  <h3 className="font-bold text-white/90 text-sm mb-1">{insight.title}</h3>
                  <p className="text-xs text-white/40 leading-relaxed font-medium">{insight.description}</p>
                </div>
              </motion.div>
            ))}

            <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-emerald-600/5 border border-white/5 mt-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center space-x-2 text-indigo-400 mb-3">
                  <Info className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Growth Vector</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed font-medium">
                  Use the intelligence hub to analyze sales history and discover high-yield inventory opportunities or pricing optimizations based on regional demand.
                </p>
                <button className="mt-4 flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">
                  <span>View Full Report</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Chat Interface */}
          <div className="lg:col-span-9 flex flex-col min-h-0">
            <div className="flex-1 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
              
              {/* Chat Header */}
              <div className="px-8 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-indigo-500/20 rounded-[1.25rem] border border-indigo-500/30">
                      <Bot className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#0a0a0c] rounded-full" />
                  </div>
                  <div>
                    <h2 className="font-black text-base tracking-tight">AgriQon Intelligence Hub</h2>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-black">Secure • AI-Assisted • Real-time</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                   <button className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <RefreshCcw className="w-4 h-4 text-white/60" />
                   </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={cn(
                        "relative group max-w-[85%] md:max-w-[75%]",
                        msg.role === 'user' ? "items-end" : "items-start"
                      )}>
                        {/* Context Badge for AI */}
                        {msg.role === 'assistant' && msg.contextSource && (
                          <div className="flex items-center space-x-1.5 mb-2 px-1">
                            {msg.contextSource === 'vector' ? (
                              <div className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-widest text-emerald-400/70">
                                <Search className="w-2.5 h-2.5" />
                                <span>External Knowledge Match</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-[9px] font-black uppercase tracking-widest text-indigo-400/70">
                                <Database className="w-2.5 h-2.5" />
                                <span>Internal Business Context</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cn(
                          "rounded-[2rem] px-6 py-4.5 shadow-2xl relative",
                          msg.role === 'user' 
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none' 
                            : 'bg-white/[0.05] text-white/90 border border-white/10 backdrop-blur-md rounded-tl-none'
                        )}>
                          <div className={cn(
                            "prose prose-invert max-w-none text-sm md:text-[15px] leading-relaxed",
                            "prose-strong:text-indigo-300 prose-strong:font-black",
                            "prose-table:border prose-table:border-white/10 prose-th:bg-white/5 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2"
                          )}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                          <div className={cn(
                            "text-[10px] mt-3 font-bold opacity-30 tracking-widest",
                            msg.role === 'user' ? 'text-right' : 'text-left'
                          )}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-white/5 rounded-[1.5rem] px-6 py-4 border border-white/10 backdrop-blur-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggestions Chips */}
              <div className="px-8 pb-4 flex flex-wrap gap-2 shrink-0">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className="text-[11px] font-bold text-white/40 border border-white/5 bg-white/[0.02] hover:bg-white/10 hover:text-indigo-300 hover:border-indigo-500/30 px-4 py-2 rounded-full transition-all backdrop-blur-sm whitespace-nowrap"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-8 bg-white/[0.02] border-t border-white/10 relative">
                <div className="relative flex items-center group">
                  <div className="absolute left-6 text-white/20 group-focus-within:text-indigo-400 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about inventory, market trends, or business strategy..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-[1.75rem] py-5 pl-14 pr-16 text-[15px] focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all placeholder:text-white/20 font-medium"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-3 p-3 bg-indigo-600 hover:bg-indigo-500 rounded-[1.25rem] transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
                  >
                    <Send className="w-5 h-5 text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between px-2">
                  <div className="flex items-center space-x-6 text-[10px] text-white/20 font-black uppercase tracking-[0.15em]">
                    <div className="flex items-center space-x-1.5">
                      <Leaf className="w-3.5 h-3.5" />
                      <span>Agri-Expert Tuned</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Hybrid-RAG Engine</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-white/10 font-bold tracking-widest uppercase">
                    Aggregated Market Intelligence v2.4
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
