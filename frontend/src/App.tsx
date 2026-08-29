import { BrowserRouter } from 'react-router-dom';

import { Navbar } from '@layouts';

import AppRoutes from './routes';

export function App() {
  return (
    <BrowserRouter>
      <div className="bg-page text-ink flex min-h-screen flex-col">
        <Navbar />

        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
