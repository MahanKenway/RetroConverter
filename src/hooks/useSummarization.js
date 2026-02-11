import { useState, useCallback } from 'react';
import { summarizeText } from '../services/aiIntegrations/summarization';

/**
 * Hook for text summarization
 * Summarizes text using OpenAI
 * 
 * @returns {object} { summary, isLoading, error, summarize }
 */
export function useSummarization() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const summarize = useCallback(
    async (text, summaryLength = 'medium', options = {}) => {
      setSummary('');
      setIsLoading(true);
      setError(null);

      try {
        const result = await summarizeText(text, summaryLength, options);
        const summarizedText = result?.choices?.[0]?.message?.content || '';
        setSummary(summarizedText);
        return summarizedText;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { summary, isLoading, error, summarize };
}
