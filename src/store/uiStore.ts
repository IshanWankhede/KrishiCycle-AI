import { create } from 'zustand';
import { ChatMessage, askAiAgronomist } from '../services/aiService';
import { getWelcomeMessage } from '../services/aiChatbotData';
import { Language } from '../types';

interface ToastInfo {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface UIState {
  isAiChatOpen: boolean;
  isAiChatMinimized: boolean;
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  toasts: ToastInfo[];
  isDemoTourOpen: boolean;
  isLanguageModalOpen: boolean;
  suggestedDistrict: string;
  isConfettiActive: boolean;
  isIntroOpen: boolean;

  toggleAiChat: () => void;
  setAiChatOpen: (open: boolean) => void;
  setAiChatMinimized: (min: boolean) => void;
  resetAiChat: (lang?: Language) => void;
  sendChatMessage: (text: string, lang: Language) => Promise<void>;
  
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  
  openDemoTour: () => void;
  closeDemoTour: () => void;
  
  openIntro: () => void;
  closeIntro: () => void;
  
  setLanguageModalOpen: (open: boolean, district?: string) => void;
  triggerConfetti: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isAiChatOpen: false,
  isAiChatMinimized: false,
  chatMessages: [
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: getWelcomeMessage('en'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      disclaimer: 'Illustrative demo guidance. Validate with local KVK before field application.',
    }
  ],
  chatLoading: false,

  toasts: [],
  isDemoTourOpen: false,
  isLanguageModalOpen: false,
  suggestedDistrict: 'Pune',
  isConfettiActive: false,
  isIntroOpen: false,

  toggleAiChat: () => set((state) => ({ isAiChatOpen: !state.isAiChatOpen })),
  setAiChatOpen: (open) => set({ isAiChatOpen: open, isAiChatMinimized: false }),
  setAiChatMinimized: (min) => set({ isAiChatMinimized: min }),
  resetAiChat: (lang: Language = 'en') =>
    set({
      chatMessages: [
        {
          id: `msg_welcome_${Date.now()}`,
          sender: 'assistant',
          text: getWelcomeMessage(lang),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          disclaimer: 'Illustrative demo guidance. Validate with local KVK before field application.',
        },
      ],
      chatLoading: false,
    }),

  sendChatMessage: async (text: string, lang: Language) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMsg],
      chatLoading: true,
    }));

    try {
      const reply = await askAiAgronomist(text, lang);
      const assistantMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        disclaimer: 'AI guidance, verify with local experts.',
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, assistantMsg],
        chatLoading: false,
      }));
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: 'For local agricultural advice, please consult your taluka Krishi Vigyan Kendra (KVK).',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        disclaimer: 'AI guidance, verify with local experts.',
      };
      set((state) => ({
        chatMessages: [...state.chatMessages, fallbackMsg],
        chatLoading: false,
      }));
    }
  },

  showToast: (message, type = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      get().removeToast(id);
    }, 4000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  openDemoTour: () => set({ isDemoTourOpen: true }),
  closeDemoTour: () => set({ isDemoTourOpen: false }),

  openIntro: () => set({ isIntroOpen: true }),
  closeIntro: () => {
    try {
      sessionStorage.setItem('krishicycle_intro_seen', 'true');
    } catch {
      // Safe fallback
    }
    set({ isIntroOpen: false });
  },

  setLanguageModalOpen: (open, district = 'Pune') => set({
    isLanguageModalOpen: open,
    suggestedDistrict: district,
  }),

  triggerConfetti: () => {
    set({ isConfettiActive: true });
    setTimeout(() => {
      set({ isConfettiActive: false });
    }, 3500);
  },
}));
