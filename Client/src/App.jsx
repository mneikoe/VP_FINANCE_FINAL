// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import { initializeSampleData } from "./utils/initSampleData";


const App = () => {

  useEffect(() => {
    initializeSampleData();
  }, []);

  return (
    <BrowserRouter>
      <AppRoutes />
      <ToastContainer />

    </BrowserRouter>
  );
};

export default App;
