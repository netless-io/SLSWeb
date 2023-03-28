import { Suspense } from 'react';
import './App.css';
import {
  RouterProvider
} from 'react-router-dom'
import router from './Router';
import { useTranslation } from 'react-i18next';

export default function WrappedApp() {
  const {t} = useTranslation();

  document.title = t("web.title");
  return (
    <Suspense fallback="... is loading">
      <RouterProvider router={router} />
    </Suspense>
  );
}

