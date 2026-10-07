import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { BASE_PATH, HASH_ROUTER } from './lib/format';
import AdminLayout from './pages/AdminLayout';
import ClientView from './pages/ClientView';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import PlanEditor from './pages/PlanEditor';

const routes = (
  <Routes>
    <Route path="/c/:token" element={<ClientView />} />
    <Route path="/entrar" element={<Login />} />
    <Route element={<AdminLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/plano/:id" element={<PlanEditor />} />
    </Route>
  </Routes>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {HASH_ROUTER ? (
      <HashRouter>{routes}</HashRouter>
    ) : (
      <BrowserRouter basename={BASE_PATH}>{routes}</BrowserRouter>
    )}
  </React.StrictMode>,
);
