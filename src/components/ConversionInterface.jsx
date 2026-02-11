import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import toast, { Toaster } from 'react-hot-toast';
import { useOCR } from '../hooks/useOCR';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { useTranslation } from '../hooks/useTranslation';
import { useSummarization } from '../hooks/useSummarization';
import { useDocumentProcessing } from '../hooks/useDocumentProcessing';

const ConversionInterface = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('pdf');
  const [outputFormat, setOutputFormat] = useState('docx');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionComplete, setConversionComplete] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [summaryLength, setSummaryLength] = useState('medium');

  // AI Hooks
  const { extractedText, isLoading: ocrLoading, error: ocrError, extractText } = useOCR();
  const { audioData, isLoading: ttsLoading, error: ttsError, convert: convertTTS } = useTextToSpeech();
  const { translatedText, isLoading: translationLoading, error: translationError, translate } = useTranslation();
  const { summary, isLoading: summaryLoading, error: summaryError, summarize } = useSummarization();
  const { processedData, isLoading: docProcessingLoading, error: docProcessingError, process: processDoc } = useDocumentProcessing();
