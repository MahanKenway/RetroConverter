import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import Windows98DesktopInterface from './pages/windows-98-desktop-interface';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';

const AnalyticsTracker = () => {
  useGoogleAnalytics();
  return null;
};

const Routes = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AnalyticsTracker />
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<Windows98DesktopInterface />} />
        <Route path="/windows-98-desktop-interface" element={<Windows98DesktopInterface />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
