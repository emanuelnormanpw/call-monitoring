import type { ReactNode } from 'react';

export interface NavDrawerItem {
  label: string;
  to: string;
  end?: boolean;
}

export interface PropsType {
  open: boolean;
  items: NavDrawerItem[];
  brand: ReactNode;
  onClose: () => void;
}
