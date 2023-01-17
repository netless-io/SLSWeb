import { Suspense } from 'react';
import './App.css';
import {
  RouterProvider
} from 'react-router-dom'
import router from './Router';

export default function WrappedApp() {
  return (
    <Suspense fallback="... is loading">
      <RouterProvider router={router} />
    </Suspense>
  );
}

