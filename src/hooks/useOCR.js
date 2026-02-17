import { useState, useCallback } from 'react';
import { extractTextFromImage } from '../services/aiIntegrations/ocr';

/**
 * Hook for OCR (Optical Character Recognition)
 * Extracts text from images using OpenAI Vision API
 * 
 * @returns {object} { extractedText, isLoading, error, extractText }
 */
export function useOCR() {
  const [extractedText, setExtractedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const extractText = useCallback(
    async (imageBase64, options = {}) => {
      setExtractedText('');
      setIsLoading(true);
      setError(null);

      try {
        const result = await extractTextFromImage(imageBase64, options);
        const text = result?.choices?.[0]?.message?.content || '';
        setExtractedText(text);
        return text;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { extractedText, isLoading, error, extractText };
}
