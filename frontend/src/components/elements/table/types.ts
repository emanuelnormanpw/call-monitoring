import type { Table } from '@tanstack/react-table';

import type { CallItem } from '@repositories/calls';

export interface PropsType {
  table: Table<CallItem>;
}
