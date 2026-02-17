import React from "react";
import Routes from "./Routes";
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes />
    </>
  );
}

export default App;
