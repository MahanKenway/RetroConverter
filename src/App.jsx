import React from "react";
import Routes from "./Routes";
import { Toaster } from 'react-hot-toast';
import useGoogleAnalytics from './hooks/useGoogleAnalytics';

function App() {
  useGoogleAnalytics();

  return (
    <>
      <Toaster position="top-right" />
      <Routes />
    </>
  );
}

export default App;
