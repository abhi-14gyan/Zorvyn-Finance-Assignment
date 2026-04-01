import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from "./context/ThemeContext";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <App />
        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
</React.StrictMode>


);

