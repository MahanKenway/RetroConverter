/**
 * Google Analytics Event Tracking Service
 * Tracks conversion types, file operations, processing times, and user engagement
 */

/**
 * Track conversion start event
 * @param {string} category - Conversion category (pdf, image, audio, video, etc.)
 * @param {string} conversionType - Specific conversion type (e.g., 'pdf-to-docx')
 * @param {number} fileSize - File size in bytes
 * @param {string} fileName - Name of the file
 */
export const trackConversionStart = (category, conversionType, fileSize, fileName) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'conversion_start', {
      event_category: 'Conversion',
      conversion_category: category,
      conversion_type: conversionType,
      file_size_bytes: fileSize,
      file_size_mb: (fileSize / (1024 * 1024))?.toFixed(2),
      file_name: fileName,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track conversion completion event
 * @param {string} category - Conversion category
 * @param {string} conversionType - Specific conversion type
 * @param {number} fileSize - File size in bytes
 * @param {number} processingTime - Processing time in milliseconds
 * @param {boolean} success - Whether conversion was successful
 */
export const trackConversionComplete = (category, conversionType, fileSize, processingTime, success = true) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'conversion_complete', {
      event_category: 'Conversion',
      conversion_category: category,
      conversion_type: conversionType,
      file_size_bytes: fileSize,
      file_size_mb: (fileSize / (1024 * 1024))?.toFixed(2),
      processing_time_ms: processingTime,
      processing_time_seconds: (processingTime / 1000)?.toFixed(2),
      success: success,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track file upload event
 * @param {string} fileType - Type of file uploaded
 * @param {number} fileSize - File size in bytes
 * @param {string} category - Conversion category
 */
export const trackFileUpload = (fileType, fileSize, category) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'file_upload', {
      event_category: 'File Operation',
      file_type: fileType,
      file_size_bytes: fileSize,
      file_size_mb: (fileSize / (1024 * 1024))?.toFixed(2),
      conversion_category: category,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track file download event
 * @param {string} conversionType - Type of conversion
 * @param {string} outputFormat - Output format
 */
export const trackFileDownload = (conversionType, outputFormat) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'file_download', {
      event_category: 'File Operation',
      conversion_type: conversionType,
      output_format: outputFormat,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track category selection
 * @param {string} category - Selected category
 */
export const trackCategorySelection = (category) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'category_select', {
      event_category: 'User Engagement',
      selected_category: category,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track conversion type selection
 * @param {string} category - Conversion category
 * @param {string} conversionType - Selected conversion type
 */
export const trackConversionTypeSelection = (category, conversionType) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'conversion_type_select', {
      event_category: 'User Engagement',
      conversion_category: category,
      conversion_type: conversionType,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track AI feature usage
 * @param {string} aiFeature - AI feature used (ocr, tts, translation, etc.)
 * @param {number} processingTime - Processing time in milliseconds
 */
export const trackAIFeatureUsage = (aiFeature, processingTime) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'ai_feature_usage', {
      event_category: 'AI Features',
      ai_feature: aiFeature,
      processing_time_ms: processingTime,
      processing_time_seconds: (processingTime / 1000)?.toFixed(2),
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track conversion error
 * @param {string} conversionType - Type of conversion
 * @param {string} errorMessage - Error message
 * @param {string} errorType - Type of error
 */
export const trackConversionError = (conversionType, errorMessage, errorType = 'unknown') => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'conversion_error', {
      event_category: 'Error',
      conversion_type: conversionType,
      error_message: errorMessage,
      error_type: errorType,
      timestamp: new Date()?.toISOString(),
    });
  }
};

/**
 * Track user session engagement
 * @param {string} action - User action (reset, new_conversion, etc.)
 */
export const trackUserEngagement = (action) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'user_engagement', {
      event_category: 'User Engagement',
      engagement_action: action,
      timestamp: new Date()?.toISOString(),
    });
  }
};

export default {
  trackConversionStart,
  trackConversionComplete,
  trackFileUpload,
  trackFileDownload,
  trackCategorySelection,
  trackConversionTypeSelection,
  trackAIFeatureUsage,
  trackConversionError,
  trackUserEngagement,
};
