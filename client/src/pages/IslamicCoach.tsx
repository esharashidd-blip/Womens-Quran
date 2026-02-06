import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { ArrowLeft, Send, Loader2, MessageCircle, AlertCircle, Clock } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { supabase } from "@/lib/supabase";

interface Message {
  role: 'user' | 'coach';
  content: string;
  timestamp: Date;
}

const DAILY_QUESTION_LIMIT = 5;

const SYSTEM_PROMPT = `You are a warm, knowledgeable Islamic coach designed specifically for Muslim women. Your role is to provide supportive, faith-based guidance that is:

1. SUPPORTIVE & GENTLE: Always respond with compassion and understanding. Never be judgmental or harsh.
2. ISLAMICALLY GROUNDED: Base your answers on authentic Islamic teachings from Quran and Sunnah.
3. WOMEN-CENTERED: Understand the unique challenges Muslim women face and provide relevant guidance.
4. NON-JUDGMENTAL: Meet users where they are spiritually without guilt or shame.
5. EMPOWERING: Help women feel confident in their faith journey.

Guidelines:
- Always cite Quran verses or hadith when relevant
- Acknowledge that scholarly opinions may differ on some matters
- Encourage seeking local scholarly guidance for complex fiqh matters
- Be warm and use gentle, encouraging language
- Keep responses concise but meaningful (2-4 paragraphs)
- End responses with a short dua or reminder when appropriate

Topics you can help with:
- Daily Islamic practices and their meanings
- Emotional/spiritual struggles from an Islamic perspective
- Questions about prayer, fasting, hijab, and other acts of worship
- Relationships within Islamic framework
- Personal development through Islamic lens
- Understanding Quran and hadith

Topics to redirect:
- Medical advice → "Please consult a healthcare professional"
- Legal matters → "Please consult a qualified Islamic scholar (mufti)"
- Serious mental health → "Please reach out to a mental health professional. Your wellbeing matters to Allah."`;

export default function IslamicCoach() {
  const { data: settings } = useSettings();
  const updateSettings = useUpdateSettings();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const questionsToday = settings?.coachLastQuestionDate === today
    ? (settings?.coachQuestionsToday || 0)
    : 0;
  const remainingQuestions = DAILY_QUESTION_LIMIT - questionsToday;
  const canAskQuestion = remainingQuestions > 0;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !canAskQuestion) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Update question count
      const newCount = settings?.coachLastQuestionDate === today
        ? (settings?.coachQuestionsToday || 0) + 1
        : 1;

      updateSettings.mutate({
        coachQuestionsToday: newCount,
        coachLastQuestionDate: today
      });

      // Get auth token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || '';

      // Call Gemini API through our backend
      const response = await fetch('/api/coach/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            content: m.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      const coachMessage: Message = {
        role: 'coach',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachMessage]);
    } catch (err) {
      setError("I'm sorry, I couldn't process your question. Please try again later.");
      console.error('Coach error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen pb-nav-safe flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg px-4 py-4 border-b border-primary/5">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <Link href="/more">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-serif text-lg">Islamic Coach</h1>
            <p className="text-xs text-muted-foreground">Faith-based guidance for sisters</p>
          </div>
          <div className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" />
            <span>{remainingQuestions} left today</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg mx-auto w-full">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-accent/30 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-serif mb-2">Salam, dear sister</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              I'm here to offer Islamic guidance and support. Ask me anything about faith, worship, or life from an Islamic perspective.
            </p>
            <div className="space-y-2 w-full max-w-xs">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Try asking:</p>
              <button
                onClick={() => setInput("How can I strengthen my connection with Allah?")}
                className="w-full text-left p-3 bg-white/80 rounded-xl text-sm hover:bg-white transition-colors border border-primary/10"
              >
                "How can I strengthen my connection with Allah?"
              </button>
              <button
                onClick={() => setInput("What does Islam say about dealing with anxiety?")}
                className="w-full text-left p-3 bg-white/80 rounded-xl text-sm hover:bg-white transition-colors border border-primary/10"
              >
                "What does Islam say about dealing with anxiety?"
              </button>
              <button
                onClick={() => setInput("How can I be a better Muslim woman?")}
                className="w-full text-left p-3 bg-white/80 rounded-xl text-sm hover:bg-white transition-colors border border-primary/10"
              >
                "How can I be a better Muslim woman?"
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-white/90 border border-primary/10 rounded-tl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-[10px] mt-2 ${message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {format(message.timestamp, 'h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/90 border border-primary/10 p-4 rounded-2xl rounded-tl-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <Card className="bg-rose-50 border-rose-200 p-4 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-sm text-rose-700">{error}</span>
                </Card>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-background border-t border-primary/5 px-4 py-4">
        <div className="max-w-lg mx-auto">
          {!canAskQuestion ? (
            <Card className="bg-amber-50 border-amber-200 p-4 rounded-xl text-center">
              <p className="text-sm text-amber-800">
                You've reached your daily limit of {DAILY_QUESTION_LIMIT} questions.
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Come back tomorrow for more guidance, inshaAllah.
              </p>
            </Card>
          ) : (
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                className="flex-1 h-12 rounded-xl bg-white/80 border-primary/10"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="h-12 w-12 rounded-xl"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
