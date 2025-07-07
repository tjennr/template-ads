import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TemplateAds from './components/TemplateAds';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <TemplateAds />
  </React.StrictMode>
);