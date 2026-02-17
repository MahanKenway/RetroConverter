import { callLambdaFunction } from '../aiClient';

const CHAT_COMPLETION_ENDPOINT = import.meta.env?.VITE_AWS_LAMBDA_CHAT_COMPLETION_URL;

/**
 * Extract text from image using OpenAI Vision API
 * 
 * @param {string} imageBase64 - Base64 encoded image (with or without data URI prefix)
 * @param {object} options - Additional parameters
 * @returns {Promise<object>} Response with extracted text
 */
export async function extractTextFromImage(imageBase64, options = {}) {
  // Ensure proper data URI format
  const imageDataUri = imageBase64?.startsWith('data:') 
    ? imageBase64 
    : `data:image/jpeg;base64,${imageBase64}`;

  const payload = {
    provider: 'OPEN_AI',
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          { 
            type: 'text', 
            text: 'Extract all text from this image. Return only the extracted text without any additional commentary or formatting.' 
          },
          {
            type: 'image_url',
            image_url: {
              url: imageDataUri,
              detail: options?.detail || 'high'
            }
          }
        ]
      }
    ],
    stream: false,
    parameters: {
      max_completion_tokens: options?.max_tokens || 2048,
      temperature: 0.1
    }
  };

  const response = await callLambdaFunction(CHAT_COMPLETION_ENDPOINT, payload);
  return response;
}
