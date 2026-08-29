import { BrowserRouter, NavLink } from 'react-router-dom';

import { CIMBLogo } from '@shapes';
import { cn } from '@utils/cn';

import AppRoutes from './routes';

const NAV_LINK_CLASS =
  'rounded-control inline-flex items-center px-3.25 py-2 text-sm transition-colors';

export function App() {
  return (
    <BrowserRouter>
      <div className="bg-page text-ink flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 flex h-14.5 items-center justify-between gap-4 bg-[#3c3c40] px-6 text-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-2.5 select-none">
              <CIMBLogo height={24} width={24} />
            </NavLink>

            <nav className="ml-4 flex items-center gap-1">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  cn(
                    NAV_LINK_CLASS,
                    isActive
                      ? 'text-blue bg-white font-bold shadow-xs'
                      : 'font-medium text-white hover:bg-white/14',
                  )
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  cn(
                    NAV_LINK_CLASS,
                    isActive
                      ? 'text-blue bg-white font-bold shadow-xs'
                      : 'font-medium text-white hover:bg-white/14',
                  )
                }
              >
                Settings
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-[9px] bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20">
              Supervisor
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-6">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
