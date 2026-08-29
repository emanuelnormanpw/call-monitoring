import { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Dashboard } from '@modules';
import { LoadingSpinner } from '@elements';

const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="rounded-card border-border bg-card text-ink-2 border p-6 text-center text-sm">
          <LoadingSpinner />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
