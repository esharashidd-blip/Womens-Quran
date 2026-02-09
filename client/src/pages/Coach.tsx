import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// ScrollArea removed - causes flex layout issues on iOS
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Send,
  Plus,
  MessageCircle,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  useConversations,
  useMessages,
  useTokenUsage,
  useCreateConversation,
  useSendMessage,
  useDeleteConversation,
  type CoachConversation,
  type CoachMessage,
} from "@/hooks/use-coach";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/90 border border-primary/10 rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function TokenUsageBar({ used, limit }: { used: number; limit: number }) {
  const percentage = Math.min((used / limit) * 100, 100);
  const isLow = percentage > 80;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Daily tokens used</span>
        <span className={isLow ? "text-orange-500 font-medium" : ""}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isLow ? "bg-orange-500" : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  selectedId,
  onSelect,
  onNew,
  onDelete,
  isCreating,
}: {
  conversations: CoachConversation[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onNew: () => void;
  onDelete: (id: number) => void;
  isCreating: boolean;
}) {
  const [deleteId, setDeleteId] = useState<number | null>(null);

  return (
    <>
      <div className="space-y-2">
        <Button
          onClick={onNew}
          disabled={isCreating}
          className="w-full gap-2 rounded-xl"
          variant="outline"
        >
          {isCreating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Conversation
        </Button>

        {conversations.length === 0 ? (
          <Card className="p-6 text-center bg-white/60 border-white/50 rounded-2xl">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Start a conversation with your Islamic life coach
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`p-3 rounded-xl cursor-pointer transition-all group ${
                  selectedId === conv.id
                    ? "bg-primary/10 border-primary/30"
                    : "bg-white/70 border-white/50 hover:bg-white/90"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {conv.title || "New Conversation"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(conv.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ChatView({
  conversationId,
  messages,
  isLoading,
  onBack,
  onSend,
  isSending,
  tokenUsage,
}: {
  conversationId: number;
  messages: CoachMessage[];
  isLoading: boolean;
  onBack: () => void;
  onSend: (content: string) => void;
  isSending: boolean;
  tokenUsage?: { used: number; remaining: number; dailyLimit: number; allowed: boolean };
}) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change or when typing
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  const handleSend = () => {
    if (!input.trim() || isSending) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = tokenUsage?.allowed !== false;

  // Scroll to bottom when keyboard opens (iOS)
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const onResize = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    viewport.addEventListener('resize', onResize);
    return () => viewport.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-4 border-b border-primary/10 bg-background" style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 44px)' }}>
        <div className="flex items-center gap-3 py-2 w-full">
          <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-serif text-lg">Islamic Life Coach</h2>
            <p className="text-xs text-muted-foreground">Faith-based guidance for sisters</p>
          </div>
        </div>
      </div>

      {/* Token usage */}
      {tokenUsage && (
        <div className="flex-shrink-0 px-4 py-2 border-b border-primary/5">
          <TokenUsageBar used={tokenUsage.used} limit={tokenUsage.dailyLimit} />
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-medium">Assalamu Alaikum, Sister</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share what's on your heart. I'm here to listen and offer
                faith-based guidance with warmth and understanding.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {[
                "I'm feeling anxious",
                "Help with patience",
                "Marriage advice",
                "Spiritual guidance",
              ].map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs"
                  onClick={() => {
                    setInput(prompt);
                    inputRef.current?.focus();
                  }}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-white/90 border border-primary/10 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p
                    className={`text-[10px] mt-1 ${
                      msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isSending && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pt-3 border-t border-primary/10 bg-background" style={{ paddingBottom: 'max(calc(1rem + env(safe-area-inset-bottom, 0px)), 2.5rem)' }}>
        {!canSend ? (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 rounded-xl p-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              Daily token limit reached. Please try again tomorrow.
            </p>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 300)}
              placeholder="Share what's on your heart..."
              disabled={isSending}
              className="flex-1 h-12 rounded-xl bg-white/80 border-primary/10"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isSending}
              size="icon"
              className="h-12 w-12 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Coach() {
  const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversationId);
  const { data: tokenUsage } = useTokenUsage();

  const createConversation = useCreateConversation();
  const sendMessage = useSendMessage();
  const deleteConversation = useDeleteConversation();

  const handleNewConversation = async () => {
    try {
      const conv = await createConversation.mutateAsync();
      setSelectedConversationId(conv.id);
    } catch {
      toast({
        title: "Could not start conversation",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversationId) return;
    try {
      await sendMessage.mutateAsync({ conversationId: selectedConversationId, content });
    } catch {
      toast({
        title: "Message failed to send",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteConversation.mutateAsync(id);
      if (selectedConversationId === id) {
        setSelectedConversationId(null);
      }
    } catch {
      toast({
        title: "Could not delete conversation",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show chat view if a conversation is selected
  if (selectedConversationId !== null) {
    return (
      <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-primary/5 via-background to-primary/10 z-50" style={{ height: '100dvh' }}>
        <ChatView
          conversationId={selectedConversationId}
          messages={messages}
          isLoading={messagesLoading}
          onBack={() => setSelectedConversationId(null)}
          onSend={handleSendMessage}
          isSending={sendMessage.isPending}
          tokenUsage={tokenUsage}
        />
      </div>
    );
  }

  // Show conversation list
  return (
    <div className="min-h-screen pb-nav-safe px-4 pt-6 md:px-8 max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-serif">Islamic Life Coach</h1>
        <p className="text-sm text-muted-foreground">
          Faith-based guidance for sisters. Share what's on your heart.
        </p>
      </div>

      {tokenUsage && (
        <Card className="p-4 bg-white/70 border-white/50 rounded-2xl">
          <TokenUsageBar used={tokenUsage.used} limit={tokenUsage.dailyLimit} />
        </Card>
      )}

      {conversationsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
          isCreating={createConversation.isPending}
        />
      )}

      <Card className="p-4 bg-primary/5 border-primary/10 rounded-2xl">
        <p className="text-xs text-muted-foreground text-center">
          This coach provides spiritual guidance and support based on Islamic principles.
          For serious matters, please consult a qualified scholar or professional.
        </p>
      </Card>
    </div>
  );
}
