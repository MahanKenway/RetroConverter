import { useState, useCallback } from 'react';
import { translateText } from '../services/aiIntegrations/translation';

/**
 * Hook for text translation
 * Translates text between languages using OpenAI
 * 
 * @returns {object} { translatedText, isLoading, error, translate }
 */
export function useTranslation() {
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const translate = useCallback(
    async (text, targetLanguage, sourceLanguage = 'auto-detect', options = {}) => {
      setTranslatedText('');
      setIsLoading(true);
      setError(null);

      try {
        const result = await translateText(text, targetLanguage, sourceLanguage, options);
        const translated = result?.choices?.[0]?.message?.content || '';
        setTranslatedText(translated);
        return translated;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { translatedText, isLoading, error, translate };
}
