import React from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';
import GaussianSplatViewer from './GaussianSplatViewer';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <GaussianSplatViewer />
  </React.StrictMode>
);
