export interface NavItem {
  label: string;
  to: string;
  end?: boolean;
  /** Whether the item also appears in the mobile drawer. */
  inDrawer: boolean;
}
