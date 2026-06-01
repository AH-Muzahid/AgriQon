'use client';

import React, { useRef, useEffect } from 'react';
import { Bot, Mic, Send, Sparkles, MessageSquareDot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantViewProps {
  chatMessages: Message[];
  chatInput: string;
  setChatInput: (input: string) => void;
  handleSendMessage: (text: string) => void;
  aiIsTyping: boolean;
}

export default function AIAssistantView({
  chatMessages,
  chatInput,
  setChatInput,
  handleSendMessage,
  aiIsTyping
}: AIAssistantViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiIsTyping]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-[32px] border border-[#eef2ef] shadow-sm max-w-3xl mx-auto flex flex-col justify-between min-h-[600px] animate-fade-in text-[#17231f]">
      <div>
        {/* Assistant Header */}
        <div className="flex items-center gap-3.5 border-b border-[#eef2ef] pb-5 mb-5">
          <motion.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="size-11 bg-gradient-to-tr from-[#0f4f3a] to-[#1bb886] rounded-2xl flex items-center justify-center text-white shadow-sm"
          >
            <Bot className="size-6" />
          </motion.div>
          <div>
            <h3 className="text-sm font-black text-[#17231f] flex items-center gap-1.5">
              <span>আগ্রিকন এআই সহকারী</span>
              <Sparkles className="size-3.5 text-amber-500 fill-amber-400" />
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-wider">Harvest Agent Pro</p>
            </div>
          </div>
        </div>

        {/* Message bubble thread */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 no-scrollbar">
          <AnimatePresence initial={false}>
            {chatMessages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 28 }}
                  className={`flex gap-3.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm text-lg ${
                    isUser 
                      ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800' 
                      : 'bg-gradient-to-br from-[#e8f3ec] to-[#d8e8dc] text-[#0f4f3a]'
                  }`}>
                    {isUser ? '👨‍🌾' : '🤖'}
                  </div>
                  <div className={`max-w-[75%] p-4 rounded-2xl text-xs font-black leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-[#0f4f3a] text-white rounded-tr-none' 
                      : 'bg-[#f4f7f5] text-gray-700 rounded-tl-none border border-gray-100'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {aiIsTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3.5"
            >
              <div className="size-9 rounded-xl bg-gradient-to-br from-[#e8f3ec] to-[#d8e8dc] text-[#0f4f3a] flex items-center justify-center text-lg shadow-sm">🤖</div>
              <div className="bg-[#f4f7f5] px-4.5 py-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1.5">
                <span className="size-2 bg-[#0f4f3a] rounded-full animate-bounce [animation-duration:0.8s]"></span>
                <span className="size-2 bg-[#0f4f3a] rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></span>
                <span className="size-2 bg-[#0f4f3a] rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></span>
              </div>
            </motion.div>
          )}
          <div ref={scrollRef} />
        </div>
      </div>

      {/* Suggestion tags & chat input */}
      <div className="border-t border-[#eef2ef] pt-5 mt-5 space-y-5">
        {/* Suggestion Chips */}
        <div className="space-y-2">
          <span className="text-[9px] font-black text-[#66756e] uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquareDot className="size-3.5 text-[#0f4f3a]" /> দ্রুত প্রশ্ন জিজ্ঞাসা করুন:
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              'আজকে কত বিক্রি হলো?',
              'কোন পণ্য কম স্টক?',
              'কার কাছে বাকি টাকা আছে?',
              'সবচেয়ে বেশি বিক্রি কোন পণ্য?'
            ].map((chip, idx) => (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSendMessage(chip)}
                className="px-4 py-2.5 border border-[#d3ebd8] hover:border-[#0f4f3a] bg-[#e8f3ec]/40 hover:bg-[#e8f3ec] rounded-2xl text-[10px] font-black text-[#0f4f3a] transition-all cursor-pointer shadow-sm hover:shadow"
              >
                {chip}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="flex gap-3">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
            placeholder="আজকে ড্যাশবোর্ড বা ব্যবসা নিয়ে কী জানতে চান..."
            className="flex-1 bg-[#f4f7f5] border border-[#eef2ef] rounded-2xl px-5 py-3.5 text-xs font-black focus:outline-none focus:border-[#0f4f3a] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,79,58,0.06)] transition-all text-[#17231f]"
          />
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSendMessage(chatInput)}
            className="px-5.5 bg-[#0f4f3a] hover:bg-[#082d22] text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
          >
            <Send className="size-4" />
            <span>পাঠান</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              alert('ভয়েস রিকগনিশন সক্রিয় করা হচ্ছে...');
            }}
            className="p-3.5 bg-[#e8f3ec] border border-[#d3ebd8] hover:bg-[#d8e8dc] rounded-2xl text-[#0f4f3a] cursor-pointer shadow-sm"
          >
            <Mic className="size-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
