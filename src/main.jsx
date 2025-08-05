// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // <-- Import BrowserRouter here
import App from './App.jsx';
import './index.css'; // Your main stylesheet

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* This is the ONLY <BrowserRouter> in your entire app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);