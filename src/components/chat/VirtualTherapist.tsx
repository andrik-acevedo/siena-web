// src/components/ai/VirtualTherapist.tsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Send,
  AlertCircle,
  Armchair,
  User as UserIcon,
  Loader2,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Brain,
  Heart,
  ChevronDown,
  ChevronUp,
  Trash2,
  Search,
  X,
  Plus,
} from 'lucide-react';
import Button from '../ui/Button';
import { sendChatMessage } from '../../lib/openai';
import { useUser } from '../../context/UserContext';
import { useMessageLimit } from '../../context/MessageLimitContext';
import MessageLimitDisplay from './MessageLimitDisplay';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Message {
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatHistoryItem {
  id: string;
  messages: Message[];
  created_at: string;
}

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: `Hi! I'm Siena, your AI companion. While I'm here to support your wellness journey with insights and coping strategies, please remember I'm not a substitute for professional therapy. I cannot provide medical advice or crisis intervention. If you're experiencing a crisis, please contact your healthcare provider or emergency services. How can I support you today?`,
  timestamp: new Date(),
};

const STARTER_PROMPTS = [
  'Help me understand my emotions better',
  "I'd like to work on self-compassion",
  'How can I improve my relationships?',
  'I need help with stress management',
  "I'm feeling anxious and need some coping strategies",
  'Guide me through a quick mindfulness exercise',
];

const PROMPT_COLORS = [
  'from-[#008792] to-[#006a70]',
  'from-[#00789f] to-[#005a77]',
  'from-[#0068aa] to-[#004d7f]',
  'from-[#e88584] to-[#8e4f63]',
  'from-[#ea697c] to-[#b8455c]',
  'from-[#7b5595] to-[#5d4070]',
];

const SYSTEM_PROMPT: Message = {
  role: 'system',
  content: `You are Siena, a friendly, smart, and quirky AI companion on LovePath. Your personality is warm, authentic, and relatable, while maintaining professional therapeutic support. You use a conversational tone, occasional humor, and gentle wit, but always remain grounded in therapeutic principles.`,
  timestamp: new Date(),
};

function formatMarkdown(text: string): string {
  let formatted = text;

  // Headers: ### text -> <h3>
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-2">$1</h3>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2">$1</h2>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>');

  // Bold: **text** (process before italic to avoid conflicts)
  formatted = formatted.replace(/\*\*(.+?)\*\*/gs, '<strong>$1</strong>');

  // Italic: *text*
  formatted = formatted.replace(/\*(.+?)\*/gs, '<em>$1</em>');

  // Code: `text`
  formatted = formatted.replace(/`(.+?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>');

  return formatted;
}

/** Collapsible green Tips section (matches Journal/Sleep styling) */
const AiTherapistGuide = () => (
  <div className="mt-6 bg-gradient-to-br from-[#01B1AF] to-[#018a88] rounded-lg p-4 md:p-6 space-y-4 text-white text-sm">
    <div className="flex items-center space-x-4 mb-2 md:mb-4">
      <HelpCircle className="h-8 w-8 text-white" />
      <h2 className="text-xl font-semibold text-white">Getting the Most from Siena</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Left column: principles */}
      <div className="space-y-5">
        <div className="flex items-start space-x-3">
          <Brain className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Ask focused questions</h3>
            <p className="text-white/80">
              Brief context + a clear ask works best. For example: “I shut down when my partner raises their
              voice—how can I stay regulated and respond?”.
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Heart className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Name feelings & needs</h3>
            <p className="text-white/80">
              Share what you’re feeling (anxious, ashamed, resentful) and what you’d like help doing (set a
              boundary, repair after conflict, self-soothe).
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Sparkles className="h-6 w-6 text-white mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white">Try, reflect, iterate</h3>
            <p className="text-white/80">
              Ask for a 3–step plan, try it, then report back what worked/didn’t. Siena can refine with you,
              just like a skills coach.
            </p>
          </div>
        </div>
      </div>

      {/* Right column: quick actions */}
      <div className="bg-white/10 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">Quick Actions</h3>
        <div className="space-y-4">
          <div>
            <div className="text-white font-medium mb-1">In the moment</div>
            <ul className="text-white/80 space-y-2">
              <li>• “Give me a 60-second grounding exercise.”</li>
              <li>• “Offer a repair script for after I snapped.”</li>
              <li>• “Co-create a boundary I can use today.”</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Skills building</div>
            <ul className="text-white/80 space-y-2">
              <li>• “Teach me a 4-step reframe for anxious thoughts.”</li>
              <li>• “Role-play a hard conversation with me.”</li>
              <li>• “Help me set a weekly mini-goal and track it.”</li>
            </ul>
          </div>

          <div>
            <div className="text-white font-medium mb-1">Good to know</div>
            <ul className="text-white/80 space-y-2">
              <li>• Siena isn’t a crisis service or a substitute for therapy.</li>
              <li>• Keep shares lightweight—avoid sensitive identifiers.</li>
              <li>• Use Notes or copy replies you want to keep elsewhere.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

/* -------------------- Portal + Composer components -------------------- */

function ComposerPortal({ children }: { children: React.ReactNode }) {
  if (typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

type ComposerProps = {
  onSubmit: () => void;
  composerRef: React.RefObject<HTMLFormElement>;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLimitReached: boolean;
};

function ComposerForm({
  onSubmit,
  composerRef,
  textareaRef,
  input,
  setInput,
  isLoading,
  isAuthenticated,
  isLimitReached,
}: ComposerProps) {
  return (
    <form
      ref={composerRef}
      onSubmit={(e) => {
  e.preventDefault();
  onSubmit();
}}
      className="
        bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70
        border-t border-gray-200 p-3
        z-[1000] pointer-events-auto
      "
      style={{ paddingBottom: `max(12px, env(safe-area-inset-bottom))` }}
      aria-label="Message composer"
    >
      <div className="mx-4 md:mx-0 flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor="ai-message" className="sr-only">
            Type your message
          </label>
          <textarea
            id="ai-message"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
            rows={1}
            className="
              w-full resize-none rounded-xl border border-gray-300 bg-white text-gray-900
              placeholder:text-gray-400 py-3 px-4 focus:ring-2 focus:ring-brand-green
              max-h-[180px] leading-6
            "
            placeholder={
              !isAuthenticated
                ? 'Please log in to chat'
                : isLimitReached
                ? 'Daily limit reached - upgrade for unlimited messages'
                : 'Type a message…'
            }
            disabled={isLoading || !isAuthenticated || isLimitReached}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSubmit();
              }
            }}
          />
          <p className="mt-1 text-[11px] text-gray-500">Press Enter to send • Shift + Enter for a new line</p>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !input.trim() || !isAuthenticated || isLimitReached}
          className="bg-gradient-to-br from-[#01B1AF] to-[#018a88] hover:opacity-90 text-white rounded-xl px-4 py-3"
          aria-label="Send message"
          title="Send"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
}

/* ------------------------------- Main ------------------------------- */

export default function VirtualTherapist() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { authState, userData } = useUser();
  const { canSendMessage, isLimitReached, incrementMessageCount } = useMessageLimit();
  const isAuthenticated = authState.status === 'authenticated';

  /* ----- Helpers ----- */
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior,
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }
  };

  const updateComposerHeightVar = () => {
    const h = composerRef.current?.offsetHeight ?? 88;
    document.documentElement.style.setProperty('--composer-h', `${h}px`);
  };

  const autoSizeTextarea = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    const next = Math.min(el.scrollHeight, 6 * 24 + 16); // ~6 rows cap
    el.style.height = `${next}px`;
    scrollToBottom('auto');
  };

  /* ----- Effects ----- */
  useEffect(() => {
    autoSizeTextarea();
  }, [input]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let mounted = true;

    const loadHistory = async () => {
      if (!isAuthenticated) {
        setIsLoadingHistory(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('id, messages, created_at')
          .eq('user_id', authState.user?.id)
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) throw error;
        if (!mounted) return;
        if (data?.length > 0) setChatHistory(data as ChatHistoryItem[]);
      } catch (err) {
        if (!mounted) return;
        console.error('Error loading chat history:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat history');
      } finally {
        if (mounted) setIsLoadingHistory(false);
      }
    };

    loadHistory();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, authState.user?.id]);

  // Sync --composer-h and handle mobile keyboard overlap with visualViewport
  useEffect(() => {
    updateComposerHeightVar();
    const ro = new ResizeObserver(updateComposerHeightVar);
    if (composerRef.current) ro.observe(composerRef.current);

    const onResize = () => updateComposerHeightVar();
    window.addEventListener('resize', onResize);

    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const handleVV = () => {
      if (!vv) return;
      const keyboardOffset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      document.documentElement.style.setProperty('--kb', `${keyboardOffset}px`);
    };
    if (vv) {
      vv.addEventListener('resize', handleVV);
      vv.addEventListener('scroll', handleVV);
      handleVV();
    }

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', onResize);
      if (vv) {
        vv.removeEventListener('resize', handleVV);
        vv.removeEventListener('scroll', handleVV);
      }
    };
  }, []);

  /* ----- Actions ----- */
  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    if (!isAuthenticated) {
      setError('Please log in to use the chat feature.');
      return;
    }
    if (!canSendMessage) {
      setError('Daily message limit reached. Upgrade to Plus or Premium for unlimited messages.');
      return;
    }

    const userMessage: Message = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const canProceed = await incrementMessageCount();
      if (!canProceed) {
        setError('Daily message limit reached. Please upgrade for unlimited messages.');
        setIsLoading(false);
        return;
      }

      const response = await sendChatMessage([
        SYSTEM_PROMPT,
        ...messages.map(({ role, content }) => ({ role, content })),
        { role: userMessage.role, content: userMessage.content },
      ]);

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollToBottom('smooth'), 30);
    }
  };

  const handleStarterPrompt = (prompt: string) => {
    setInput(prompt);
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setTimeout(() => textareaRef.current?.focus(), 150);
  };

  const loadChatHistory = (msgs: Message[]) => {
    setMessages(msgs);
    scrollToBottom('auto');
  };

  const startNewChat = () => {
    if (!confirm('Start a new chat? Your current conversation will be saved to history.')) return;
    setMessages([INITIAL_MESSAGE]);
    setInput('');
    setError(null);
    scrollToBottom('auto');
    toast.success('New chat started');
  };

  const deleteChatHistory = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;

    try {
      const { error, data } = await supabase
        .from('chat_history')
        .delete()
        .eq('id', chatId)
        .eq('user_id', authState.user?.id);

      if (error) {
        console.error('Delete error details:', error);
        throw error;
      }

      // Only update state if delete was successful
      setChatHistory(chatHistory.filter(chat => chat.id !== chatId));
      toast.success('Chat deleted successfully');
    } catch (err) {
      console.error('Error deleting chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete chat';
      toast.error(`Failed to delete: ${errorMessage}`);
    }
  };

  const filteredChatHistory = chatHistory.filter((chat) => {
    if (!searchQuery) return true;
    const firstMessage = chat.messages.find((msg) => msg.role === 'user');
    return firstMessage?.content.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const displayedChats = showAllHistory ? filteredChatHistory : filteredChatHistory.slice(0, 3);

  /* ----- Loading UI ----- */
  if (isLoadingHistory) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-brand-green animate-spin" />
      </div>
    );
  }

  /* ------------------------------- UI ------------------------------- */
  return (
    <div className="max-w-7xl mx-auto isolate">
      {/* Header + Tips toggle */}
      <div className="relative rounded-xl overflow-hidden bg-gradient-to-b from-[#01B1AF] to-[#018a88] p-8 mb-8">
        <div className="relative z-10 flex items-start md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">AI Therapist</h1>
            <p className="text-lg text-white/80">
              Chat with Siena, your AI wellness companion for support and guidance
            </p>
            <div className="mt-3 bg-white/10 border border-white/20 rounded-lg p-3">
              <p className="text-white/90 text-sm">
                <strong>Note:</strong> This feature is for personal wellness feedback or tracking only and is not intended for storing medical records.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowGuide((s) => !s)}
            className="flex items-center space-x-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/15 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-white" />
            <span className="text-white text-sm font-medium">Tips</span>
            {showGuide ? <ChevronUp className="h-4 w-4 text-white" /> : <ChevronDown className="h-4 w-4 text-white" />}
          </button>
        </div>

        {showGuide && <AiTherapistGuide />}
      </div>

      {/* Sidebar + Chat */}
      <div className="flex flex-col md:flex-row w-full md:min-h-[600px] px-4">
        {/* Sidebar */}
        <aside className="w-full md:w-80 bg-gray-100 border-r border-gray-200 p-4 space-y-6 rounded-t-xl md:rounded-l-xl md:rounded-tr-none mb-4 md:mb-0">
          <MessageLimitDisplay />

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Starter Prompts</h3>
            <div className="space-y-2">
              {STARTER_PROMPTS.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleStarterPrompt(prompt)}
                  disabled={isLimitReached}
                  className={`w-full text-left p-3 text-sm text-white rounded-lg flex items-center space-x-2 transition-colors ${
                    isLimitReached ? 'opacity-50 cursor-not-allowed bg-gray-300' : 'hover:bg-white/10'
                  } bg-gradient-to-br ${PROMPT_COLORS[index]}`}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200/10 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Chat History</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    startNewChat();
                  }}
                  type="button"
                  className="flex items-center gap-1 text-xs text-white bg-teal-600 hover:bg-teal-700 font-medium px-2 py-1 rounded transition-colors"
                  title="Start new chat"
                >
                  <Plus className="h-3 w-3" />
                  New
                </button>
                {chatHistory.length > 3 && (
                  <button
                    onClick={() => setShowAllHistory(!showAllHistory)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    {showAllHistory ? 'Show Less' : `View All (${chatHistory.length})`}
                  </button>
                )}
              </div>
            </div>

            {chatHistory.length > 0 && (
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-10 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            <div className={`space-y-2 ${showAllHistory ? 'max-h-[400px] overflow-y-auto pr-1' : ''}`}>
              {displayedChats.length > 0 ? (
                displayedChats.map((chat) => {
                  const firstMessage = chat.messages.find((msg) => msg.role === 'user');
                  if (!firstMessage) return null;
                  return (
                    <div
                      key={chat.id}
                      className="relative group"
                    >
                      <button
                        onClick={() => loadChatHistory(chat.messages)}
                        className="w-full text-left p-3 text-sm text-gray-700 hover:bg-white rounded-lg flex items-center space-x-2 transition-colors border border-gray-200"
                      >
                        <MessageSquare className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="truncate flex-1">{firstMessage.content}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChatHistory(chat.id);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all bg-white rounded"
                        title="Delete chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchQuery ? 'No chats found' : 'No chat history yet'}
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* Chat Area */}
        <section className="relative flex-1 flex flex-col bg-gray-100 pb-24 md:pb-0">
          {error && (
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 m-4 rounded-lg">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="ml-3 text-sm text-red-500">{error}</p>
              </div>
            </div>
          )}

          {/* Scroll area: bottom padding matches live composer height */}
          <div
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-200 m-4 overscroll-contain mb-20 md:mb-4"
          >
            <div className="p-4 space-y-4">
              {messages.map((message, index) => {
                const avatarUrl = (userData as any)?.avatar_url || null;
                const emoji = userData?.avatar_emoji || '🌿';

                return (
                  <div key={index} className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                    <div
                      className={`flex items-start space-x-2 max-w-[85%] ${
                        message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 rounded-full overflow-hidden ${
                          message.role === 'assistant' ? 'bg-brand-green/10 p-2' : 'bg-white/10'
                        }`}
                        style={{ width: '36px', height: '36px' }}
                      >
                        {message.role === 'assistant' ? (
                          <Armchair className="h-5 w-5 text-brand-green" />
                        ) : avatarUrl ? (
                          <img src={avatarUrl} alt="You" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-lg">{emoji}</div>
                        )}
                      </div>
                      <div
                        className={`rounded-2xl p-4 ${
                          message.role === 'assistant' ? 'bg-gray-100 text-gray-800' : 'bg-brand-green/90 text-white'
                        }`}
                      >
                        <div
                          className="whitespace-pre-wrap text-sm md:text-base"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                        />
                        <p className={`text-xs mt-2 ${
                          message.role === 'assistant' ? 'text-gray-500' : 'text-white/80 font-medium'
                        }`}>
                          {message.timestamp instanceof Date ? message.timestamp.toLocaleTimeString() : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl p-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Desktop composer (static under chat) */}
          <div className="hidden md:block md:p-4 md:bg-transparent">
            <ComposerForm
              onSubmit={handleSubmit}
              composerRef={composerRef}
              textareaRef={textareaRef}
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              isAuthenticated={isAuthenticated}
              isLimitReached={isLimitReached}
            />
          </div>

          {/* Mobile composer (true fixed via portal) */}
          <div className="md:hidden">
            <ComposerPortal>
              <div
                className="fixed inset-x-0 bottom-0 isolate md:hidden"
                style={{ zIndex: 1000 }}
              >
                <ComposerForm
                  onSubmit={handleSubmit}
                  composerRef={composerRef}
                  textareaRef={textareaRef}
                  input={input}
                  setInput={setInput}
                  isLoading={isLoading}
                  isAuthenticated={isAuthenticated}
                  isLimitReached={isLimitReached}
                />
              </div>
            </ComposerPortal>
          </div>
        </section>
      </div>
    </div>
  );
}
