// src/pages/chatpage/ChatAssistant.tsx
import { Layout } from '@/components/Layout/Layout';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import './ChatAssistant.css';

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
      <div className="chat-page-container">
        
        {/* Chat history */}
        <div className="chat-history">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message ai">
              <div className="message-text typing-indicator">
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-input-area">
          <div className="input-wrapper">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message or use voice recording..."
              disabled={isLoading || isRecording}
              rows={1}
            />
            
            {/* Audio level indicator */}
            {isRecording && (
              <div className="audio-level-indicator">
                <div 
                  className="audio-level-bar" 
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            )}
            
            {/* Mic Button */}
            <button
              onClick={toggleRecording}
              disabled={isLoading}
              className={micButtonClass}
              aria-label={isRecording ? "Stop recording" : "Start voice recording"}
            >
              <MicButtonIcon size={20} />
            </button>
            
            {/* Send Button */}
            {inputValue.trim() !== '' && !isRecording && (
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading}
                className="send-button"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            )}
          </div>
          
          {/* Status messages */}
          {isRecording && (
            <p className="recording-status">🔴 Recording... Click mic to stop</p>
          )}
          {voiceError && (
            <p className="voice-error">{voiceError}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ChatAssistant;