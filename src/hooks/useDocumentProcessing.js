import { useState, useCallback } from 'react';
import { processDocument } from '../services/aiIntegrations/documentProcessing';

/**
 * Hook for intelligent document processing
 * Processes PDFs and documents using OpenAI Vision and chat completion
 * 
 * @returns {object} { processedData, isLoading, error, process }
 */
export function useDocumentProcessing() {
  const [processedData, setProcessedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const process = useCallback(
    async (documentBase64, task = 'analyze', query = '', options = {}) => {
      setProcessedData(null);
      setIsLoading(true);
      setError(null);

      try {
        const result = await processDocument(documentBase64, task, query, options);
        const content = result?.choices?.[0]?.message?.content || '';
        setProcessedData({ content, fullResponse: result });
        return { content, fullResponse: result };
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { processedData, isLoading, error, process };
}
