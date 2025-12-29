import * as googleTTS from 'google-tts-api';

class TTSService {
  constructor() {
    // google-tts-api doesn't require an API key for basic usage
  }

  /**
   * getAudioUrl(text, [options])
   * Returns a URL to the audio file (hosted by Google Translate)
   * @param {string} text
   */
  getAudioUrl(text) {
    try {
      if (text.length > 200) {
        // Handle long text by splitting or warning? 
        // For now, let's just truncate or take the first chunk for the URL method
        // But for better UX, we might want to just get the base64.
        console.warn('Text too long for single URL, truncating...');
        text = text.substring(0, 200);
      }
      
      const url = googleTTS.getAudioUrl(text, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
      });
      return url;
    } catch (error) {
      console.error('TTS URL generation error:', error);
      throw new Error('Failed to generate TTS URL');
    }
  }

  /**
   * getAudioBase64(text, [options])
   * Returns a base64 string of the audio
   * Automatically handles long text by splitting
   * @param {string} text
   */
  async getAudioBase64(text) {
    try {
      // getAllAudioBase64 splits the text and returns an array of base64 strings
      // We'll join them or return the array. For simplicity, let's return a single base64 if possible
      // or handle the array in the socket.
      
      const results = await googleTTS.getAllAudioBase64(text, {
        lang: 'en',
        slow: false,
        host: 'https://translate.google.com',
        timeout: 10000,
      });

      // Results is an array of objects { shortText, base64 }
      // We want to combine them or stream them.
      // For socket streaming, returning the array is useful.
      return results.map(r => r.base64);

    } catch (error) {
      console.error('TTS Base64 generation error:', error);
      throw new Error('Failed to generate TTS audio');
    }
  }
}

export default new TTSService();
