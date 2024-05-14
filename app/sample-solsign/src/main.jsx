import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import './output.css';
import Manage from './pages/Manage';
import Signatures from './pages/Signatures';
import Layout from './layout/main';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <Manage />
      </Layout>
    ),
  },
  {
    path: '/signatures',
    element: (
      <Layout>
        <Signatures />
      </Layout>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
