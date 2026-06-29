import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Projects from './Projects';

const Root = window.location.pathname.replace(/\/+$/, '') === '/projects' ? Projects : App;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
