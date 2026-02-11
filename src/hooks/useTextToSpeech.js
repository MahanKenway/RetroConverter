import { useState, useCallback } from 'react';
import { convertTextToSpeech } from '../services/aiIntegrations/textToSpeech';

/**
 * Hook for Text-to-Speech
 * Converts text to speech using OpenAI TTS API
 * 
 * @returns {object} { audioData, isLoading, error, convert }
 */
export function useTextToSpeech() {
  const [audioData, setAudioData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const convert = useCallback(
    async (text, options = {}) => {
      setAudioData(null);
      setIsLoading(true);
      setError(null);

      try {
        const result = await convertTextToSpeech(text, options);
        setAudioData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { audioData, isLoading, error, convert };
}
