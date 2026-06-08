'use client';

import React, { useState, useRef, useEffect } from 'react';
import { PageShell } from '@/components/page-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Send, Bot, User, Trash2, ArrowRight, MessageSquare, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello Muzahid! I'm your AgroAI assistant. I can analyze warehouse spaces, calculate sales velocities, and retrieve outstanding due invoices. What would you like to audit today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    { label: 'Show low stock products', text: 'Show low stock products in warehouses.' },
    { label: 'Summarize monthly sales', text: "Summarize this month's sales velocity." },
    { label: 'Show overdue invoices', text: 'Show overdue customer invoices and balances.' },
    { label: 'Restocking suggestions', text: 'Generate inventory restocking suggestions.' },
  ];

  const recentConvos = [
    { id: '1', title: 'Dhaka Central Utilization Audit' },
    { id: '2', title: 'Outstanding Receivables Aging' },
    { id: '3', title: 'Fertilizer SKU Velocity Forecast' },
  ];

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let reply = '';
      const normText = textToSend.toLowerCase();

      if (normText.includes('low stock') || normText.includes('stock')) {
        reply = `**Low Stock Inventory Warning**:\n\n1. **Organic Compost (25kg)**\n   * Location: Dhaka Central Hub\n   * Available: 12 units (Safety Min: 20)\n   * Status: **LOW_STOCK**\n\n2. **Pesticide Concentrate (1L)**\n   * Location: Dhaka Central Hub\n   * Available: 5 units (Safety Min: 10)\n   * Status: **LOW_STOCK**\n\nWould you like me to generate replenishment purchase orders?`;
      } else if (normText.includes('sales') || normText.includes('revenue')) {
        reply = `**Monthly Sales Performance Audit**:\n\n* **Gross Booked Revenue**: ৳156,250.00\n* **Total Fulfilled Orders**: 2 orders (৳34,500 and ৳112,000)\n* **AOV (Average Order Value)**: ৳52,083.33\n* **Category Leaders**:\n  1. Fertilizers: ৳112,000 (71.6%)\n  2. Seeds: ৳34,500 (22.1%)\n  3. Equipment: ৳9,750 (6.3%)\n\nOverall profit margin is currently optimized at **28.4%**.`;
      } else if (normText.includes('overdue') || normText.includes('invoice') || normText.includes('due')) {
        reply = `**Outstanding Receivables Report**:\n\n* **INV-2026-8821** (Rahim Agritech Farms): ৳9,750.00\n* **INV-2026-8822** (Sarkar Agro Industries): ৳112,000.00\n* **Total Due Balance**: ৳121,750.00\n\n*Suggestion*: Rahim Agritech has 3 active pending orders. I recommend requesting settlement before dispatching new wholesale SKUs.`;
      } else if (normText.includes('restock') || normText.includes('replenish')) {
        reply = `**Replenishment Sourcing Plan**:\n\nBased on monthly inventory velocity ratios, I suggest restocking:\n* **Organic Compost (25kg)**: Sourcing target: **100 units** from SoilVigor.\n* **Pesticide Concentrate (1L)**: Sourcing target: **30 units** from InsectiShield.\n\nThis will restore buffer parameters to 1.5x of regional average monthly sales.`;
      } else {
        reply = `I have completed an audit of the current workspace parameters:\n\n* **Seat Occupancy**: 50% consumed (5 active seats out of 10).\n* **Logistics Nodes**: 3 active warehouses (Dhaka Central, Bogura Cold Storage, Jessore Distribution Hub).\n* **Storage Capacity**: Average utilization at **68%** capacity limits.\n\nType "show low stock products" or "show overdue invoices" for specific lists.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: reply,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Workspace chat flushed. How can I help you analyze AgriQon's logistics metrics today?",
      },
    ]);
  };

  return (
    <PageShell
      title="AgroAI Copilot Workspace"
      description="Leverage natural language reasoning models to analyze inventory velocity and revenue trends."
      actions={
        <Button variant="outline" size="sm" onClick={handleClear} className="text-xs gap-1.5 cursor-pointer">
          <Trash2 className="size-4 text-rose-500" />
          Clear Workspace Chat
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-4 h-[calc(100vh-220px)] min-h-[500px]">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="border shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold text-slate-800">Recent Audits</CardTitle>
            </CardHeader>
            <CardContent className="p-3 flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto max-h-[300px]">
                <div className="space-y-1">
                  {recentConvos.map((convo) => (
                    <button
                      key={convo.id}
                      onClick={() => handleSend(convo.title)}
                      className="w-full text-left text-xs p-2.5 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all font-medium text-slate-600 truncate flex items-center gap-2"
                    >
                      <MessageSquare className="size-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{convo.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t text-[10px] text-muted-foreground flex gap-1.5 items-center">
                <Bot className="size-3.5 text-primary" />
                <span>Powered by Gemini 1.5 reasoning</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border shadow-sm flex-1 flex flex-col justify-between overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scroll-smooth" ref={scrollContainerRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`size-7 rounded-lg border flex items-center justify-center shrink-0 ${
                    msg.role === 'user' 
                      ? 'bg-slate-100 text-slate-700 border-slate-200' 
                      : 'bg-primary/10 text-primary border-primary/20'
                  }`}>
                    {msg.role === 'user' ? <User className="size-4" /> : <Bot className="size-4" />}
                  </div>
                  <div className={`p-3 rounded-xl border leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white border-primary rounded-tr-none'
                      : 'bg-slate-50 border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-line'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 max-w-[85%]">
                  <div className="size-7 rounded-lg border bg-primary/10 text-primary border-primary/20 flex items-center justify-center shrink-0">
                    <Bot className="size-4 animate-pulse" />
                  </div>
                  <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-muted-foreground flex gap-1 items-center">
                    <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="size-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="p-3 border-t bg-slate-50/50 space-y-3">
              {/* Suggested prompts tags */}
              <div className="flex flex-wrap gap-1.5">
                {suggestedPrompts.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => handleSend(p.text)}
                    className="text-[10px] font-semibold bg-background hover:bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1 text-slate-600 transition-all cursor-pointer shadow-sm hover:border-slate-300"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Ask copilot to audit active stock quantities or billing collections..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="text-xs bg-background h-10 flex-1"
                />
                <Button type="submit" disabled={!input.trim() || isTyping} className="h-10 cursor-pointer shadow-sm">
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </Card>
        </div>

        {/* Insights Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card className="border shadow-sm flex-1 overflow-y-auto">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="size-4 text-amber-500" />
                Real-time Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <Card className="border shadow-sm bg-rose-50/20 border-rose-100 p-3 flex gap-3 items-start">
                <AlertTriangle className="size-5 text-rose-500 shrink-0" />
                <div>
                  <span className="font-bold text-rose-800 block">Critical Capacity Warning</span>
                  <p className="text-[10px] text-rose-600 mt-0.5">Dhaka Central has hit 750 MT storage limit. Dispatch delays expected.</p>
                </div>
              </Card>

              <Card className="border shadow-sm bg-emerald-50/20 border-emerald-100 p-3 flex gap-3 items-start">
                <TrendingUp className="size-5 text-emerald-500 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-800 block">High Category Margin</span>
                  <p className="text-[10px] text-emerald-600 mt-0.5">Fertilizers are maintaining an optimal 37.5% net sales margin markup.</p>
                </div>
              </Card>

              <Card className="border shadow-sm bg-amber-50/20 border-amber-100 p-3 flex gap-3 items-start">
                <DollarSign className="size-5 text-amber-500 shrink-0" />
                <div>
                  <span className="font-bold text-amber-800 block">Receivables Risk</span>
                  <p className="text-[10px] text-amber-600 mt-0.5">Outstanding customer dues stand at ৳121,750.00 across open statements.</p>
                </div>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageShell>
  );
}
