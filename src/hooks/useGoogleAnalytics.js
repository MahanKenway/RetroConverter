import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useGoogleAnalytics() {
  const location = useLocation();

  useEffect(() => {
    const measurementId = import.meta.env?.VITE_GA_MEASUREMENT_ID;
    
    if (!measurementId || measurementId === 'your-google-analytics-id-here') {
      console.warn('Google Analytics: Measurement ID not configured');
      return;
    }

    if (!window.dataLayer) {
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.async = true;
      document.head?.appendChild(script);

      window.dataLayer = [];
      window.gtag = function gtag() {
        window.dataLayer?.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', measurementId);
    }

    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_path: location?.pathname + location?.search,
      });
    }
  }, [location]);
}

export default useGoogleAnalytics;
