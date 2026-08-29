import { IS_MAINTENANCE } from '@constants/config';
import { CustomError } from '@utils/react-query/model/custom-fetch';

export const MAINTENANCE_LS_KEY = 'isMaintenance';

export function getIsMaintenance(): boolean {
  const envValue = IS_MAINTENANCE;

  if (typeof window === 'undefined') return envValue;

  const override = window.localStorage.getItem(MAINTENANCE_LS_KEY);
  if (override === 'true') return true;
  if (override === 'false') return false;

  return envValue;
}

export class MaintenanceError extends CustomError<{ isMaintenance: true }> {
  constructor() {
    super('Maintenance Mode', { isMaintenance: true }, { retry: false });
    this.name = 'MaintenanceError';
  }
}

export function throwIfMaintenance(): void {
  if (getIsMaintenance()) throw new MaintenanceError();
}
