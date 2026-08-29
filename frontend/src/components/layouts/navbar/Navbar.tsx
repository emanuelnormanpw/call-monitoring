import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { NavDrawer } from '@layouts/nav-drawer';
import { CIMBLogo, MenuIcon } from '@shapes';
import { cn } from '@utils/cn';

import { DESKTOP_MEDIA_QUERY, NAV_ITEMS } from './constants';

const NAV_LINK_CLASS =
  'rounded-control inline-flex items-center px-3.25 py-2 text-sm transition-colors';

const Navbar = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Resizing up to desktop hides the drawer, so close it explicitly —
  // otherwise the body scroll lock would stay behind.
  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setIsDrawerOpen(false);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const drawerItems = NAV_ITEMS.filter((item) => item.inDrawer);

  const handleOpenDrawer = () => setIsDrawerOpen(true);

  const handleCloseDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 flex h-14.5 items-center justify-between gap-4 bg-[#3c3c40] px-6 text-white shadow-[0_1px_0_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Buka menu"
            aria-expanded={isDrawerOpen}
            onClick={handleOpenDrawer}
            className="-ml-2 cursor-pointer rounded-[9px] p-1.5 text-white transition-colors hover:bg-white/14 min-[769px]:hidden"
          >
            <MenuIcon height={22} width={22} />
          </button>

          <NavLink to="/" className="flex items-center gap-2.5 select-none">
            <CIMBLogo height={24} width={24} />
          </NavLink>

          <nav className="ml-4 hidden items-center gap-1 min-[769px]:flex">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    NAV_LINK_CLASS,
                    isActive
                      ? 'text-blue bg-white font-bold shadow-xs'
                      : 'font-medium text-white hover:bg-white/14',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-[9px] bg-white/10 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/20">
            Supervisor
          </span>
        </div>
      </header>

      <NavDrawer
        open={isDrawerOpen}
        items={drawerItems}
        brand={<CIMBLogo height={26} width={26} />}
        onClose={handleCloseDrawer}
      />
    </>
  );
};

export default Navbar;
