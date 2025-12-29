import { Layout } from '@/components/Layout/Layout';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isError?: boolean;
}

const translations = {
  "Type your message or use voice recording...": { en: "Type your message or use voice recording...", ar: "اكتب رسالتك أو استخدم التسجيل الصوتي..." },
  "Type message or use voice": { en: "Type message or use voice", ar: "اكتب رسالة أو استخدم الصوت" },
  "Chat with Mira...": { en: "Chat with Mira...", ar: "تحدث مع ميرا..." },
  "Thinking...": { en: "Thinking...", ar: "أفكر..." },
  "Sorry, I couldn't process that request. Please try again.": { en: "Sorry, I couldn't process that request. Please try again.", ar: "عذراً، لم أتمكن من معالجة هذا الطلب. الرجاء المحاولة مرة أخرى." },
  "Stop recording": { en: "Stop recording", ar: "إيقاف التسجيل" },
  "Start voice recording": { en: "Start voice recording", ar: "بدء التسجيل الصوتي" },
  "Recording... Click mic to stop": { en: "🔴 Recording... Click mic to stop", ar: "🔴 جاري التسجيل... انقر على الميكروفون للإيقاف" },
  'Speech recognition not supported in this browser': { en: 'Speech recognition not supported in this browser', ar: 'التعرف على الكلام غير مدعوم في هذا المتصفح' },
  'No speech detected. Please speak clearly and try again.': { en: 'No speech detected. Please speak clearly and try again.', ar: 'لم يتم اكتشاف أي كلام. يرجى التحدث بوضوح والمحاولة مرة أخرى.' },
  'Microphone access denied. Please allow microphone permissions.': { en: 'Microphone access denied. Please allow microphone permissions.', ar: 'تم رفض الوصول إلى الميكروفون. يرجى السماح بأذونات الميكروفون.' },
  'Network error. Please check your connection.': { en: 'Network error. Please check your connection.', ar: 'خطأ في الشبكة. يرجى التحقق من اتصالك.' },
  'Speech recognition failed': { en: 'Speech recognition failed', ar: 'فشل التعرف على الكلام' },
  'Could not understand speech. Please try again.': { en: 'Could not understand speech. Please try again.', ar: 'لم أستطع فهم الكلام. يرجى المحاولة مرة أخرى.' },
  'Failed to start speech recognition': { en: 'Failed to start speech recognition', ar: 'فشل بدء التعرف على الكلام' },
  'System Error': { en: 'System Error', ar: 'خطأ في النظام' }
};

const MiraAssistant: React.FC = () => {
  const { language } = useLanguage();
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  // Socket and Audio Refs
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingAudioRef = useRef(false);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const t = (key: keyof typeof translations) => {
    return translations[key][language];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Socket.io
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    socketRef.current = io(backendUrl, {
      transports: ['websocket', 'polling'], // Prioritize websocket
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('voice:transcription', (data: { text: string, isFinal: boolean }) => {
      // Update the user's current message bubble or input with the transcription
      // If result is final, we might want to "lock it in"
      // data.text is the transcript
      
      // For now, let's update the input value so the user sees what's being heard
      // or append a temporary user message.
      // Updating input value is simpler for now, or a "live caption" area.
      // But the user wants "ai voice chatting", so usually it appears as a message.
      
      // Strategy: Update a temporary "voice" message in the list, or just input.
      // Let's use input for interim, and send as message on final (handled by backend usually? no, backend sends final transcript too).
      // Actually backend handles the query on final transcript. So we just show the user what was said.
      
      if (data.isFinal) {
        // Add user message
        const userMsg: Message = {
            id: Date.now(),
            text: data.text,
            sender: 'user'
        };
        setMessages(prev => [...prev, userMsg]);
        setInputValue(''); // clear any interim text
        setIsLoading(true); // AI is processing
      } else {
        // Show interim in input
        setInputValue(data.text);
      }
    });

    socket.on('voice:processing', () => {
      setIsLoading(true);
    });

    socket.on('voice:text-response', (data: { text: string }) => {
      setIsLoading(false);
      const aiMsg: Message = {
        id: Date.now() + 1,
        text: data.text,
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMsg]);
    });

    socket.on('voice:audio-chunk', (base64Chunk: string) => {
      queueAudioChunk(base64Chunk);
    });

    socket.on('voice:response-complete', () => {
      // Maybe visually indicate finished talking?
    });

    socket.on('voice:error', (error: { message: string }) => {
      console.error('Socket voice error:', error);
      setVoiceError(error.message);
      setIsRecording(false);
      setIsLoading(false);
      stopRecording();
    });

    return () => {
      stopRecording();
      socket.disconnect();
    };
  }, []);

  const queueAudioChunk = (base64Chunk: string) => {
    audioQueueRef.current.push(base64Chunk);
    playNextChunk();
  };

  const playNextChunk = () => {
    if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return;

    isPlayingAudioRef.current = true;
    const chunk = audioQueueRef.current.shift();
    if (!chunk) return;

    const audio = new Audio(`data:audio/mp3;base64,${chunk}`);
    currentAudioRef.current = audio;
    
    audio.onended = () => {
      isPlayingAudioRef.current = false;
      playNextChunk();
    };
    
    audio.onerror = (e) => {
      console.error("Audio playback error", e);
      isPlayingAudioRef.current = false;
      playNextChunk();
    };

    audio.play().catch(e => {
        console.error("Play failed", e);
        isPlayingAudioRef.current = false;
        playNextChunk();
    });
  };

  const startRecording = async () => {
    try {
      setVoiceError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm', // Deepgram supports webm
      });
      
      mediaRecorderRef.current = mediaRecorder;

      socketRef.current?.emit('voice:start');

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          socketRef.current?.emit('voice:stream', event.data);
          
          // Visualize audio level (fake implementation for now or simple volume meter)
          // For real volume meter we need AudioContext.
          // Randomize for visual feedback slightly to show "alive"
          setAudioLevel(Math.random() * 100);
        }
      };

      mediaRecorder.start(250); // Send chunks every 250ms
      setIsRecording(true);

    } catch (error) {
      console.error('Error starting recording:', error);
      setVoiceError(t('Microphone access denied. Please allow microphone permissions.'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    socketRef.current?.emit('voice:stop');
    setIsRecording(false);
    setAudioLevel(0);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim();
    if (message === '' || isLoading) return;

    const newUserMessage: Message = {
      id: Date.now(),
      text: message,
      sender: 'user'
    };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const replyText = data.data?.reply || data.reply || 'No response received';
      
      const newAiMessage: Message = {
        id: Date.now() + 1,
        text: replyText,
        sender: 'ai'
      };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = {
        id: Date.now(),
        text: t("Sorry, I couldn't process that request. Please try again."),
        sender: 'ai',
        isError: true
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const MicButtonIcon = isRecording ? Square : Mic;

  return (
    <Layout>
      <div className="flex flex-col h-full w-full bg-background text-foreground">

        {/* Chat history */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 max-w-3xl w-full mx-auto relative">
          {messages.map((msg) => (
            <div key={msg.id} className={`max-w-[85%] p-4 rounded-xl break-words leading-normal text-base ${
              msg.sender === 'user'
                ? 'self-end bg-primary text-primary-foreground rounded-br-md'
                : 'self-start bg-muted text-muted-foreground border border-border rounded-bl-md'
            } ${msg.isError ? 'bg-destructive text-destructive-foreground border-destructive' : ''}`}>
              <div className="message-text whitespace-pre-line">{msg.text}</div>
            </div>
          ))}
          {isLoading && (
            <div className="self-start bg-muted text-muted-foreground border border-border rounded-xl rounded-bl-md p-4 max-w-[85%]">
              <div className="typing-indicator italic text-muted-foreground">
                {t("Thinking...")}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-border bg-background max-w-3xl w-full mx-auto relative">
          <div className="relative w-full flex items-center">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isMobile ? t("Chat with Mira...") : t("Type your message or use voice recording...")}
              disabled={isLoading && !isRecording} /* Allow typing if recording? Maybe not. */
              rows={1}
              className="w-full p-3 sm:p-4 pr-20 border border-input rounded-3xl resize-none font-sans text-sm sm:text-base leading-normal max-h-[150px] overflow-y-auto box-border transition-colors focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring bg-card text-foreground"
            />

            {/* Audio level indicator */}
            {isRecording && (
              <div className="absolute bottom-0 left-6 right-20 h-[3px] bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            )}

            {/* Mic Button */}
            <button
              onClick={toggleRecording}
              disabled={isLoading && !isRecording}
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 ${
                isRecording ? 'bg-destructive text-destructive-foreground shadow-md animate-pulse' : 'bg-transparent text-foreground hover:bg-muted'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isRecording ? t("Stop recording") : t("Start voice recording")}
            >
              <MicButtonIcon size={20} />
            </button>

            {/* Send Button */}
            {inputValue.trim() !== '' && !isRecording && (
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full cursor-pointer transition-colors duration-200 disabled:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            )}
          </div>

          {/* Status messages */}
          {isRecording && (
            <p className="text-destructive text-sm mt-2 text-center font-medium">{t("Recording... Click mic to stop")}</p>
          )}
          {voiceError && (
            <p className="text-destructive text-sm mt-2 text-center">{voiceError}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MiraAssistant;