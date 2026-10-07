import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { HASH_ROUTER } from './lib/format';

const Router = HASH_ROUTER ? HashRouter : BrowserRouter;
import './index.css';
import AdminLayout from './pages/AdminLayout';
import ClientView from './pages/ClientView';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PlanEditor from './pages/PlanEditor';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/c/:token" element={<ClientView />} />
        <Route path="/entrar" element={<Login />} />
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/plano/:id" element={<PlanEditor />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>,
);
