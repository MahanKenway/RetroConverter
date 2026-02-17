import { callLambdaFunction } from '../aiClient';

const CHAT_COMPLETION_ENDPOINT = import.meta.env?.VITE_AWS_LAMBDA_CHAT_COMPLETION_URL;

/**
 * Summarize text using OpenAI
 * 
 * @param {string} text - Text to summarize
 * @param {string} summaryLength - Length of summary ('short', 'medium', 'long')
 * @param {object} options - Additional parameters
 * @returns {Promise<object>} Response with summarized text
 */
export async function summarizeText(text, summaryLength = 'medium', options = {}) {
  const lengthInstructions = {
    short: 'Provide a brief summary in 2-3 sentences.',
    medium: 'Provide a comprehensive summary in 1-2 paragraphs.',
    long: 'Provide a detailed summary covering all key points in 3-4 paragraphs.'
  };

  const systemPrompt = `You are an expert at summarizing documents. ${lengthInstructions?.[summaryLength] || lengthInstructions?.medium} Focus on the main ideas, key points, and important details. Be clear and concise.`;

  const payload = {
    provider: 'OPEN_AI',
    model: 'gpt-5',
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: text
      }
    ],
    stream: false,
    parameters: {
      max_completion_tokens: options?.max_tokens || 2048,
      temperature: 0.5
    }
  };

  const response = await callLambdaFunction(CHAT_COMPLETION_ENDPOINT, payload);
  return response;
}
