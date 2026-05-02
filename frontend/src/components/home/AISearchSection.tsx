"use client"

import { useState } from "react"
import { MessageSquare, Sparkles, Send } from "lucide-react"
import { Button } from "@/components/ui"
import { Input } from "@/components/ui"

const sampleQuestions = [
  { label: "Best maize variety for rainy season?", icon: "🌽" },
  { label: "How to treat fungal infections?", icon: "🍃" },
  { label: "Optimal fertilizer ratios?", icon: "🧪" },
  { label: "Pest control tips?", icon: "🐛" },
]

export function AISearchSection() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setAnswer(
        "For optimal maize yields in the rainy season, I recommend planting DH-101 or Sammaz 15 varieties. These are drought-tolerant and have a maturity period of 90-110 days. Apply NPK 20:10:10 at 200kg/ha at planting, and top-dress with urea at 100kg/ha 6 weeks later."
      )
      setIsLoading(false)
    }, 1500)
  }

  return (
    <section className="ai-section">
      <div className="ai-copy">
        <span className="section-kicker">AI Assistant</span>
        <h2>Smart Farming Advice</h2>
        <p>
          Get instant answers to your farming questions from our AI-powered assistant. 
          Get personalized recommendations based on your soil, climate, and crop type.
        </p>
        
        <div className="mt-6">
          <p className="text-sm font-semibold mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => setQuestion(q.label)}
                className="text-sm"
              >
                <span className="mr-2">{q.icon}</span>
                {q.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="ai-panel">
        <div className="assistant-topline">
          <span>AgriQon AI Assistant</span>
          <strong>Online</strong>
        </div>
        
        {answer ? (
          <div className="answer-bubble">
            {answer}
            <div className="ai-table mt-4">
              <div>
                <span>Tip</span>
                <strong>Always test your soil before applying fertilizers</strong>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-white/10 p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">Ask me anything about farming</p>
            <p className="text-sm opacity-70 mt-2">
              Get personalized advice for your crops
            </p>
          </div>
        )}
        
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Type your question..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
          />
          <Button
            size="icon"
            onClick={handleAsk}
            disabled={isLoading || !question.trim()}
            className="shrink-0"
          >
            {isLoading ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
