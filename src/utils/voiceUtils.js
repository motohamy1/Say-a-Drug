export const speakResponse = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.8;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
};

export const processVoiceCommand = (transcript) => {
  const command = transcript.toLowerCase();
  
  // Extract drug name from voice command
  if (command.includes('search for') || command.includes('find')) {
    return command.replace(/search for|find/g, '').trim();
  }
  
  if (command.includes('what is') || command.includes('tell me about')) {
    return command.replace(/what is|tell me about/g, '').trim();
  }
  
  return command.trim();
};