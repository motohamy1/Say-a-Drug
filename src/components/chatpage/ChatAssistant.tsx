// src/pages/chatpage/ChatAssistant.tsx
import { Layout } from '@/components/Layout/Layout';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';
// No longer importing ChatAssistant.css as styles will be migrated to Tailwind

// Define TypeScript interface for messages
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isError?: boolean;
}

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // --- Voice State ---
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Function to scroll the chat history to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize audio context and analyzer for volume detection
  const initializeAudioAnalysis = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start monitoring audio levels
      monitorAudioLevel();
    } catch (error) {
      console.error('Error initializing audio analysis:', error);
      setVoiceError('Failed to initialize audio analysis');
    }
  };

  // Monitor audio level for visual feedback
  const monitorAudioLevel = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const updateLevel = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate RMS (Root Mean Square) for audio level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const level = Math.min(100, (rms / 128) * 100);
      
      setAudioLevel(level);
      
      if (isRecording) {
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      }
    };
    
    updateLevel();
  };

  // Initialize MediaRecorder
  const initializeMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Initialize audio analysis for volume visualization
      initializeAudioAnalysis(stream);
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        processRecording();
      };
      
      setVoiceError(null);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setVoiceError('Microphone access denied. Please allow microphone permissions.');
    }
  };

  // Process the recorded audio
  const processRecording = async () => {
    if (audioChunksRef.current.length === 0) {
      setVoiceError('No audio data recorded');
      return;
    }

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    audioChunksRef.current = [];

    try {
      // Convert audio to text using a speech-to-text service
      await sendAudioForTranscription(audioBlob);
    } catch (error) {
      console.error('Error processing audio:', error);
      setVoiceError('Failed to process audio recording');
    }
  };

  // Send audio to speech-to-text service (you can replace this with your preferred service)
  const sendAudioForTranscription = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      console.log('Sending audio to backend for Gemini transcription...');
      // Always send to your backend for Gemini processing
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/transcribe`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      console.log('Backend API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Transcription Data:', data);
      const transcribedText = data.text || data.transcription || '';
      
      if (transcribedText.trim()) {
        // Add transcribed text to input
        setInputValue(prev => prev + (prev ? ' ' : '') + transcribedText);
        
        // Optionally auto-send the message
        // handleSendMessage(transcribedText);
      } else {
        setVoiceError('No speech detected in recording');
        console.log('No speech detected or empty transcription.');
      }
      
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setVoiceError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle recording
  const toggleRecording = async () => {
    if (isLoading) return;

    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      
      // Stop audio level monitoring
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      setAudioLevel(0);
    } else {
      // Start recording
      if (!mediaRecorderRef.current) {
        await initializeMediaRecorder();
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
        audioChunksRef.current = [];
        mediaRecorderRef.current.start();
        setIsRecording(true);
        setVoiceError(null);
        
        // Start audio level monitoring
        monitorAudioLevel();
      }
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const message = messageText || inputValue.trim();
    if (message === '' || isLoading) return;

    // Add user message to state
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

      // Add AI response to state
      const newAiMessage: Message = { 
        id: Date.now() + 1, 
        text: data.reply, 
        sender: 'ai' 
      };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);

      // Optional: Speak the AI response (disabled as per user request)
      // if ('speechSynthesis' in window) {
      //   const utterance = new SpeechSynthesisUtterance(data.reply);
      //   const voices = speechSynthesis.getVoices();
      //   utterance.voice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      //   speechSynthesis.speak(utterance);
      // }

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = { 
        id: Date.now(), 
        text: "Sorry, I couldn't process that request. Please try again.", 
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Determine the mic button icon and style
  const MicButtonIcon = isRecording ? Square : Mic;
  const micButtonClass = `mic-button ${isRecording ? 'recording' : ''}`;

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
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
          {isLoading && (
            <div className="self-start bg-muted text-muted-foreground border border-border rounded-xl rounded-bl-md p-4 max-w-[85%]">
              <div className="typing-indicator italic text-muted-foreground">
                Thinking...
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
              placeholder="Type your message or use voice recording..."
              disabled={isLoading || isRecording}
              rows={1}
              className="w-full p-4 pr-20 border border-input rounded-3xl resize-none font-sans text-base leading-normal max-h-[150px] overflow-y-auto box-border transition-colors focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring bg-card text-foreground"
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
              disabled={isLoading}
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full cursor-pointer transition-all duration-200 ${
                isRecording ? 'bg-destructive text-destructive-foreground shadow-md animate-pulse' : 'bg-transparent text-foreground hover:bg-muted'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isRecording ? "Stop recording" : "Start voice recording"}
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
            <p className="text-destructive text-sm mt-2 text-center font-medium">🔴 Recording... Click mic to stop</p>
          )}
          {voiceError && (
            <p className="text-destructive text-sm mt-2 text-center">{voiceError}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatAssistant;