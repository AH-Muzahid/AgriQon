"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Maximize2, 
  Minimize2,
  Leaf,
  Info
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AiAssistant() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  if (pathname?.startsWith("/dashboard")) return null;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I'm your AgriQon AI guide. I can help you find fresh produce, suggest seasonal recipes, or explain our sustainable farming practices. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await apiClient.generateAiChat(input);
      const assistantMessage: Message = { 
        role: "assistant", 
        content: response.data?.content || "I'm sorry, I couldn't process that request right now. I'm still learning about our latest harvest!" 
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "I encountered a technical glitch while checking the fields. Please try again in a moment." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300",
              isMinimized ? "w-72 h-16" : "w-[400px] h-[600px] max-h-[80vh]"
            )}
          >
            {/* Header */}
            <div className="bg-[#0a4d3c] p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-emerald-400/20 rounded-2xl flex items-center justify-center">
                  <Leaf className="size-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">Harvest Helper</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-emerald-100/70 uppercase tracking-widest">AI Expert</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  {isMinimized ? <Maximize2 className="size-4" /> : <Minimize2 className="size-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-[#f8fafc]"
                >
                  {messages.map((msg, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex gap-3",
                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "size-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        msg.role === "user" ? "bg-emerald-100 text-emerald-700" : "bg-white text-[#0a4d3c]"
                      )}>
                        {msg.role === "user" ? <User className="size-4" /> : <Bot className="size-4" />}
                      </div>
                      <div className={cn(
                        "max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed font-medium shadow-sm",
                        msg.role === "user" 
                          ? "bg-[#0a4d3c] text-white rounded-tr-none" 
                          : "bg-white text-gray-700 rounded-tl-none border border-gray-50"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="size-8 rounded-xl bg-white text-[#0a4d3c] flex items-center justify-center shadow-sm">
                        <Bot className="size-4" />
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-50 shadow-sm">
                        <Loader2 className="size-4 animate-spin text-[#0a4d3c]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-5 bg-white border-t border-gray-50">
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100 focus-within:border-emerald-200 focus-within:bg-white transition-all">
                    <input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Ask about fresh produce..."
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold px-3 text-gray-700 placeholder:text-gray-400"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="size-10 bg-[#0a4d3c] text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:bg-emerald-900 active:scale-95 shadow-lg shadow-emerald-900/20"
                    >
                      <Send className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 px-1">
                    <Info className="size-3 text-gray-400" />
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Powered by AgriQon RAG
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="size-16 bg-[#0a4d3c] text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-900/40 relative group"
        >
          <Sparkles className="size-7 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 size-5 bg-emerald-400 rounded-full border-4 border-white"></div>
        </motion.button>
      )}
    </div>
  );
}
