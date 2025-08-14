import { Layout } from '@/components/Layout/Layout';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isError?: boolean;
}

const MiraAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);

  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  // Use browser's built-in speech recognition instead of backend transcription
  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.error('Speech recognition not supported');
      setVoiceError('Speech recognition not supported in this browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true; // Keep listening for longer
    recognition.interimResults = true; // Show interim results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3; // Get more alternatives for better drug name recognition
    
    // Add timeout to stop after reasonable time
    let timeoutId: NodeJS.Timeout;
    
    const stopWithTimeout = () => {
      timeoutId = setTimeout(() => {
        console.log('🎤 Auto-stopping after 10 seconds');
        recognition.stop();
      }, 10000); // 10 seconds timeout
    };

    recognition.onstart = () => {
      console.log('🎤 Speech recognition started');
      setIsRecording(true);
      setVoiceError(null);
      stopWithTimeout(); // Start timeout
    };

    recognition.onresult = (event) => {
      console.log('🎤 Speech recognition result event:', event);
      
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        
        // Check all alternatives for better drug name recognition
        let bestTranscript = result[0].transcript;
        for (let j = 0; j < result.length; j++) {
          const alternative = result[j].transcript.toLowerCase();
          // Prefer alternatives that contain drug names
          if (alternative.includes('panadol') || alternative.includes('abimol') || 
              alternative.includes('aspirin') || alternative.includes('ibuprofen')) {
            bestTranscript = result[j].transcript;
            console.log('🎤 Found drug name in alternative:', bestTranscript);
            break;
          }
        }
        
        console.log('🎤 Transcript:', bestTranscript, 'Final:', result.isFinal);
        
        if (result.isFinal) {
          finalTranscript += bestTranscript;
        }
      }
      
      if (finalTranscript.trim()) {
        console.log('🎤 Final transcript, sending to AI:', finalTranscript);
        clearTimeout(timeoutId); // Clear timeout
        recognition.stop(); // Stop after getting final result
        handleSendMessage(finalTranscript);
      }
    };

    recognition.onend = () => {
      console.log('🎤 Speech recognition ended');
      clearTimeout(timeoutId); // Clear timeout
      setIsRecording(false);
      setAudioLevel(0);
    };

    recognition.onerror = (event) => {
      console.error('🎤 Speech recognition error:', event.error);
      clearTimeout(timeoutId); // Clear timeout
      setIsRecording(false);
      setAudioLevel(0);
      
      let errorMessage = 'Speech recognition failed';
      if (event.error === 'no-speech') {
        errorMessage = 'No speech detected. Please speak clearly and try again.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Microphone access denied. Please allow microphone permissions.';
      } else if (event.error === 'network') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setVoiceError(errorMessage);
    };

    recognition.onspeechstart = () => {
      console.log('🎤 Speech detected');
    };

    recognition.onspeechend = () => {
      console.log('🎤 Speech ended');
    };

    recognition.onnomatch = () => {
      console.log('🎤 No speech match found');
      setVoiceError('Could not understand speech. Please try again.');
    };

    return recognition;
  };

  const toggleRecording = () => {
    console.log('🎤 Toggle recording clicked, isRecording:', isRecording, 'isLoading:', isLoading);
    
    if (isLoading) return;

    if (isRecording) {
      console.log('🎤 Stopping speech recognition');
      // Stop speech recognition
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    } else {
      console.log('🎤 Starting speech recognition');
      // Start speech recognition
      const recognition = initializeSpeechRecognition();
      if (recognition) {
        speechRecognitionRef.current = recognition;
        try {
          recognition.start();
          console.log('🎤 Speech recognition start() called');
        } catch (error) {
          console.error('🎤 Error starting recognition:', error);
          setVoiceError('Failed to start speech recognition');
        }
      }
    }
  };

  // Test speech recognition availability
  const testSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    console.log('🎤 Speech Recognition available:', !!SpeechRecognition);
    console.log('🎤 User agent:', navigator.userAgent);
    console.log('🎤 Is HTTPS:', location.protocol === 'https:');
    console.log('🎤 Is localhost:', location.hostname === 'localhost');
  };

  // Test on component mount
  useEffect(() => {
    testSpeechRecognition();
  }, []);

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
      console.log('Backend response:', data);

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

  useEffect(() => {
    return () => {
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
    };
  }, []);

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
              <div className="message-text whitespace-pre-line">{msg.text}</div>
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

export default MiraAssistant;