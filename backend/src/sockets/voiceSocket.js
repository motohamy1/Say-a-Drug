import { Server, Socket } from 'socket.io';
import sttService from '../services/sttService.js';
import ttsService from '../services/ttsService.js';
import aiService from '../services/AIService.js';

/**
 * @param {Server} io
 */
function setupVoiceSocket(io) {
  io.on('connection', (/** @type {Socket} */ socket) => {
    console.log('User connected to voice socket:', socket.id);

    /** @type {any} */
    let streamingSession = null;

    // Initialize Deepgram streaming session
    socket.on('voice:start', async () => {
      try {
        console.log('Starting voice session for:', socket.id);
        streamingSession = await sttService.createStream({
          onTranscript: (transcript) => {
            socket.emit('voice:transcription', { text: transcript, isFinal: false });
          },
          onFinalize: async (finalTranscript) => {
            console.log('Final transcript:', finalTranscript);
            socket.emit('voice:transcription', { text: finalTranscript, isFinal: true });
            await handleVoiceQuery(socket, finalTranscript);
          },
          onError: (error) => {
            console.error('Deepgram stream error:', error);
            socket.emit('voice:error', { message: 'Speech recognition error' });
          }
        });

        socket.emit('voice:ready');
      } catch (error) {
        console.error('Error starting voice session:', error);
        socket.emit('voice:error', { message: /** @type {any} */ (error).message });
      }
    });

    // Receive audio chunks
    socket.on('voice:stream', async (/** @type {any} */ audioData) => {
      try {
        if (streamingSession) {
          console.log(`Received audio chunk size: ${audioData ? audioData.length : 'null'}`);
          streamingSession.send(audioData);
        } else {
            console.warn('Received audio chunk but no streaming session active');
        }
      } catch (error) {
        console.error('Error sending audio chunk:', error);
      }
    });

    // Stop recording
    socket.on('voice:stop', async () => {
      try {
        if (streamingSession) {
          streamingSession.finish();
          streamingSession = null;
        }
      } catch (error) {
        console.error('Error stopping voice session:', error);
      }
    });

    socket.on('disconnect', () => {
      if (streamingSession) {
        // streamingSession.finish(); // Deepgram sdk might not have close/finish on the object directly if it's the connection
        streamingSession = null;
      }
      console.log('User disconnected from voice socket:', socket.id);
    });
  });
}

/**
 * @param {Socket} socket
 * @param {string} transcript
 */
async function handleVoiceQuery(socket, transcript) {
  try {
    console.log('=== handleVoiceQuery START ===');
    console.log('Transcript:', transcript);
    socket.emit('voice:processing', { transcript });

    // 1. Get AI Response
    console.log('Step 1: Getting AI response...');
    const responseText = await aiService.getInstance().processChatMessage(transcript);
    console.log('Step 1 DONE: AI response received, length:', responseText?.length);

    // 2. Send Text Response
    console.log('Step 2: Sending text response...');
    socket.emit('voice:text-response', { text: responseText });

    // TTS disabled - user doesn't want audio playback
    // // 3. Generate Audio Response (TTS)
    // console.log('Step 3: Generating TTS audio...');
    // const audioChunks = await ttsService.getAudioBase64(responseText);
    // console.log('Step 3 DONE: TTS audio generated, chunks:', audioChunks?.length);

    // // 4. Send Audio Chunks
    // console.log('Step 4: Sending audio chunks...');
    // for (const chunk of audioChunks) {
    //   socket.emit('voice:audio-chunk', chunk);
    // }
    
    socket.emit('voice:response-complete');
    console.log('=== handleVoiceQuery COMPLETE ===');

  } catch (error) {
    console.error('=== handleVoiceQuery ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    socket.emit('voice:error', { message: 'Failed to process your request' });
  }
}

export default setupVoiceSocket;
