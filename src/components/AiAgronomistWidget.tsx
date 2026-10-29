import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useT } from '../i18n/useT';
import { 
  Sparkles, 
  MessageSquare, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User, 
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { SUGGESTED_QUESTIONS } from '../services/aiChatbotData';

export const AiAgronomistWidget: React.FC = () => {
  const {
    isAiChatOpen,
    isAiChatMinimized,
    chatMessages,
    chatLoading,
    toggleAiChat,
    setAiChatOpen,
    setAiChatMinimized,
    resetAiChat,
    sendChatMessage,
  } = useUIStore();

  const { language } = useAuthStore();
  const { t } = useT();
  const [input, setInput] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom of conversation
  useEffect(() => {
    if (isAiChatOpen && !isAiChatMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isAiChatOpen, isAiChatMinimized, chatLoading]);

  // Focus textarea when chat opens or unminimizes
  useEffect(() => {
    if (isAiChatOpen && !isAiChatMinimized) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isAiChatOpen, isAiChatMinimized]);

  const handleSend = () => {
    if (!input.trim() || chatLoading) return;
    const textToSend = input.trim();
    setInput('');
    sendChatMessage(textToSend, language);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePromptClick = (queryText: string) => {
    if (chatLoading) return;
    sendChatMessage(queryText, language);
  };

  const handleClearChat = () => {
    resetAiChat(language);
    setShowClearConfirm(false);
  };

  return (
    <>
      {/* ─── 1. FLOATING LAUNCHER BUTTON ─── */}
      <div 
        className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 xl:bottom-6 xl:right-6 z-50 flex items-center justify-end"
      >
        <AnimatePresence>
          {!isAiChatOpen && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative group"
            >
              {/* Subtle ambient attention pulse glow */}
              <div 
                className="absolute -inset-1 rounded-full opacity-60 group-hover:opacity-100 blur-md transition-all duration-300 animate-pulse"
                style={{ background: 'radial-gradient(circle, rgba(200,242,59,0.4) 0%, rgba(13,31,23,0) 70%)' }}
              />

              {/* Accessible Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-surface-dark/95 border border-lime/30 text-xs font-bold text-white shadow-xl whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-lime animate-ping" />
                <span>{t('chat_launcher_tooltip')}</span>
              </div>

              {/* Main Launcher Button */}
              <button
                type="button"
                onClick={() => setAiChatOpen(true)}
                aria-label={t('chat_launcher_tooltip')}
                className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-lime/50"
                style={{
                  background: 'linear-gradient(135deg, #0F291E 0%, #07110D 100%)',
                  border: '1.5px solid rgba(200,242,59,0.5)',
                  boxShadow: '0 8px 32px -4px rgba(0, 0, 0, 0.6), 0 0 16px rgba(200, 242, 59, 0.25)'
                }}
              >
                {/* Assistant Emblem / Icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden relative">
                  <img 
                    src="/logo-emblem.png" 
                    alt="KrishiCycle Emblem" 
                    className="w-full h-full object-contain p-0.5 filter drop-shadow group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>

                {/* Sparkling Indicator Badge */}
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-lime text-ink flex items-center justify-center shadow-md">
                  <Sparkles className="w-2.5 h-2.5 fill-ink" />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── 2. FLOATING CHAT WINDOW PANEL ─── */}
      <AnimatePresence>
        {isAiChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed z-50 bottom-20 right-3 sm:bottom-24 sm:right-6 xl:bottom-6 xl:right-6 w-[calc(100vw-1.5rem)] sm:w-[430px] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-lime/30 transition-all duration-300 backdrop-blur-xl ${
              isAiChatMinimized ? 'h-16' : 'h-[580px] max-h-[82vh]'
            }`}
            style={{
              background: 'linear-gradient(180deg, rgba(13, 31, 23, 0.98) 0%, rgba(7, 17, 13, 0.99) 100%)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(200,242,59,0.15)'
            }}
          >
            {/* ── Header ── */}
            <div className="p-3.5 px-4 border-b border-white/10 flex items-center justify-between bg-surface-dark/90 select-none">
              <div className="flex items-center gap-3">
                <div 
                  className="w-9 h-9 rounded-full flex items-center justify-center p-0.5 shrink-0 overflow-hidden"
                  style={{
                    background: '#07110D',
                    border: '1.5px solid rgba(200,242,59,0.5)',
                    boxShadow: '0 0 10px rgba(200,242,59,0.2)'
                  }}
                >
                  <img src="/logo-emblem.png" alt="KrishiCycle" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-tight leading-none">
                      {t('chat_title')}
                    </h3>
                    <span 
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        background: 'rgba(200,242,59,0.12)',
                        color: '#C8F23B',
                        borderColor: 'rgba(200,242,59,0.3)'
                      }}
                    >
                      {t('chat_demo_badge')}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/50 mt-0.5 leading-tight">
                    {t('chat_subtitle')}
                  </p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                {/* Reset / Clear Chat Button */}
                {!isAiChatMinimized && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowClearConfirm(!showClearConfirm)}
                      title={t('chat_clear')}
                      aria-label={t('chat_clear')}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Clear Confirmation Popover */}
                    {showClearConfirm && (
                      <div className="absolute right-0 top-full mt-2 w-48 p-2.5 rounded-xl bg-surface-dark border border-lime/30 shadow-2xl z-20 space-y-2 text-xs">
                        <p className="text-white/80 font-medium leading-tight">
                          {t('chat_clear_confirm')}
                        </p>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
                            className="px-2 py-1 rounded-md text-[11px] text-white/50 hover:text-white"
                          >
                            {t('btn_cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={handleClearChat}
                            className="px-2.5 py-1 rounded-md text-[11px] font-bold text-ink bg-lime hover:bg-lime/90 transition-colors"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Minimize / Maximize */}
                <button
                  type="button"
                  onClick={() => setAiChatMinimized(!isAiChatMinimized)}
                  title={isAiChatMinimized ? t('chat_maximize') : t('chat_minimize')}
                  aria-label={isAiChatMinimized ? t('chat_maximize') : t('chat_minimize')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {isAiChatMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setAiChatOpen(false)}
                  title={t('chat_close')}
                  aria-label={t('chat_close')}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ── Sub-header Notice ── */}
            {!isAiChatMinimized && (
              <div 
                className="px-3.5 py-1.5 flex items-center gap-2 text-[11px] border-b"
                style={{
                  background: 'rgba(200,242,59,0.06)',
                  borderColor: 'rgba(200,242,59,0.15)',
                  color: 'rgba(200,242,59,0.9)'
                }}
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{t('chat_demo_notice')}</span>
              </div>
            )}

            {/* ── Body: Messages Area ── */}
            {!isAiChatMinimized && (
              <>
                <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs font-sans">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Assistant Avatar */}
                      {msg.sender === 'assistant' && (
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 overflow-hidden p-0.5"
                          style={{
                            background: '#07110D',
                            border: '1.5px solid rgba(200,242,59,0.4)'
                          }}
                        >
                          <img src="/logo-emblem.png" alt="Assistant" className="w-full h-full object-contain" />
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-md ${
                          msg.sender === 'user'
                            ? 'font-medium rounded-tr-xs'
                            : 'border border-white/10 text-neutral-200 rounded-tl-xs'
                        }`}
                        style={
                          msg.sender === 'user'
                            ? {
                                background: '#C8F23B',
                                color: '#07110D',
                                boxShadow: '0 4px 14px rgba(200,242,59,0.2)'
                              }
                            : {
                                background: 'rgba(255,255,255,0.04)',
                                borderColor: 'rgba(255,255,255,0.08)'
                              }
                        }
                      >
                        <div className="break-words">{msg.text}</div>

                        {/* Timestamp & Disclaimer */}
                        <div className="mt-2 pt-1.5 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] opacity-60">
                          <span>{msg.timestamp}</span>
                          {msg.disclaimer && (
                            <span className="italic ml-2 truncate">{msg.disclaimer}</span>
                          )}
                        </div>
                      </div>

                      {/* User Avatar */}
                      {msg.sender === 'user' && (
                        <div className="w-7 h-7 rounded-full bg-neutral-800 border border-white/15 flex items-center justify-center text-white shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5 text-lime" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Simulated Typing Delay Indicator */}
                  {chatLoading && (
                    <div className="flex gap-2.5 items-center pl-1 text-xs text-lime">
                      <div className="w-7 h-7 rounded-full bg-primary/40 border border-lime/40 flex items-center justify-center text-lime animate-spin">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div 
                        className="p-2.5 px-3.5 rounded-2xl rounded-tl-xs flex items-center gap-2 border border-lime/20"
                        style={{ background: 'rgba(200,242,59,0.06)' }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-lime animate-bounce" style={{ animationDelay: '300ms' }} />
                        <span className="text-[11px] text-white/70 ml-1 font-medium">{t('chat_typing')}</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* ── Suggested Questions Chips ── */}
                <div className="px-3 pb-2 pt-1 border-t border-white/5 bg-surface-dark/40">
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {SUGGESTED_QUESTIONS.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePromptClick(item.query[language] || item.query.en)}
                        disabled={chatLoading}
                        className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 border disabled:opacity-40 hover:scale-102"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          borderColor: 'rgba(200,242,59,0.25)',
                          color: '#E0E7E2'
                        }}
                      >
                        {item.label[language] || item.label.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Input Area ── */}
                <div className="p-3 border-t border-white/10 bg-surface-dark/95 flex items-end gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      rows={1}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={t('chat_placeholder')}
                      disabled={chatLoading}
                      className="w-full resize-none max-h-24 bg-surface-darkcard border border-neutral-700/80 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-lime transition-all duration-200 leading-relaxed font-sans"
                      style={{
                        minHeight: '38px',
                        background: 'rgba(255,255,255,0.03)'
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || chatLoading}
                    aria-label={t('chat_send')}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shrink-0"
                    style={{
                      background: '#C8F23B',
                      color: '#07110D',
                      boxShadow: '0 4px 12px rgba(200,242,59,0.3)'
                    }}
                  >
                    <Send className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
