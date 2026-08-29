import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Dashboard, Settings } from '@modules';

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="rounded-card border-border bg-card text-ink-2 border p-6 text-sm">
          Memuat halaman...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
