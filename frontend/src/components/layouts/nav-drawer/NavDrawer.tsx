import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';

import { CloseIcon } from '@shapes';
import { cn } from '@utils/cn';

import type { PropsType } from './types';

const NavDrawer = (props: PropsType) => {
  const { open, items, brand, onClose } = props;

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <div
      inert={!open}
      className={cn(
        'fixed inset-0 z-60 min-[769px]:hidden',
        !open && 'pointer-events-none',
      )}
    >
      <button
        type="button"
        aria-label="Tutup menu"
        onClick={onClose}
        className={cn(
          'absolute inset-0 h-full w-full cursor-default bg-black/50 transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />

      <aside
        aria-label="Menu navigasi"
        className={cn(
          'bg-card absolute inset-y-0 left-0 flex w-[78%] max-w-[320px] flex-col shadow-[0_10px_40px_rgba(20,30,70,0.28)] transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-border flex h-14.5 shrink-0 items-center justify-between border-b px-5">
          {brand}

          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="text-ink-2 hover:text-ink -mr-1.5 cursor-pointer rounded-[9px] p-1.5 transition-colors"
          >
            <CloseIcon height={22} width={22} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'rounded-control px-3.5 py-3 text-[15px] transition-colors',
                  isActive
                    ? 'bg-blue-soft text-blue font-bold'
                    : 'text-ink hover:bg-row-hover font-medium',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </div>
  );
};

export default NavDrawer;
