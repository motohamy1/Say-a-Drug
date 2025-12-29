import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

class STTService {
  constructor() {
    this.apiKey = process.env.DEEPGRAM_API_KEY;
    if (!this.apiKey) {
      console.warn('DEEPGRAM_API_KEY is not set. Voice features will not work.');
      this.deepgram = null;
    } else {
      try {
        this.deepgram = createClient(this.apiKey);
      } catch (error) {
        console.error('Failed to initialize Deepgram client:', error);
        this.deepgram = null;
      }
    }
  }

  /**
   * @param {Object} options
   * @param {(transcript: string) => void} [options.onTranscript]
   * @param {(transcript: string) => void} [options.onFinalize]
   * @param {(error: Error) => void} [options.onError]
   */
  async createStream(options = {}) {
    if (!this.deepgram) {
      const error = new Error('Deepgram API Key is missing. Please set DEEPGRAM_API_KEY in .env');
      if (options.onError) options.onError(error);
      throw error;
    }
    
    const { onTranscript, onFinalize, onError } = options;

    const connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      punctuate: true,
      interim_results: true,
      endpointing: 300,
      utterance_end_ms: 1000
    });

    connection.on(LiveTranscriptionEvents.Open, () => {
      console.log('Deepgram connection opened');
    });

    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0]?.transcript;
      
      if (transcript && transcript.trim() !== '') {
        if (data.is_final) {
          if (onFinalize) onFinalize(transcript);
        } else {
          if (onTranscript) onTranscript(transcript);
        }
      }
    });

    connection.on(LiveTranscriptionEvents.Error, (error) => {
      console.error('Deepgram error:', error);
      if (onError) onError(error);
    });

    connection.on(LiveTranscriptionEvents.Close, () => {
      console.log('Deepgram connection closed');
    });

    return connection;
  }
}

export default new STTService();
