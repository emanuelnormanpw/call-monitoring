import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PAGE_ELLIPSIS } from '../constants';
import Pagination from '../Pagination';
import type { PaginationProps } from '../types';

const renderPagination = (overrides: Partial<PaginationProps> = {}) => {
  const onPageChange = vi.fn();

  const props: PaginationProps = {
    page: 1,
    totalPages: 20,
    pageNumbers: [1, 2, 3, 4, 5, PAGE_ELLIPSIS, 20],
    startEntry: 1,
    endEntry: 5,
    totalData: 100,
    onPageChange,
    ...overrides,
  };

  render(<Pagination {...props} />);

  return { onPageChange };
};

describe('Pagination', () => {
  it('summarises the visible range', () => {
    renderPagination();

    expect(
      screen.getByText('Menampilkan 1–5 dari 100 data'),
    ).toBeInTheDocument();
  });

  it('renders the ellipsis as plain text rather than a button', () => {
    renderPagination();

    const buttonLabels = screen
      .getAllByRole('button')
      .map((button) => button.textContent);

    expect(buttonLabels).not.toContain('…');
    expect(screen.getByText('…')).toBeInTheDocument();
  });

  it('no longer offers a jump-to-last button', () => {
    renderPagination();

    // The last page is always present as a number, so the button was dropped.
    expect(screen.queryByText('Terakhir')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
  });

  it('disables the backwards controls on the first page', () => {
    renderPagination({ page: 1 });

    expect(screen.getByRole('button', { name: 'Pertama' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Previous page' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
  });

  it('disables the forward control on the last page', () => {
    renderPagination({
      page: 20,
      pageNumbers: [1, PAGE_ELLIPSIS, 16, 17, 18, 19, 20],
    });

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Pertama' })).toBeEnabled();
  });

  it('marks the active page for assistive tech', () => {
    renderPagination({ page: 3 });

    expect(screen.getByRole('button', { name: '3' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: '2' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('reports the page the user picked', async () => {
    const user = userEvent.setup();
    const { onPageChange } = renderPagination({ page: 1 });

    await user.click(screen.getByRole('button', { name: '20' }));
    await user.click(screen.getByRole('button', { name: 'Next page' }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 20);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 2);
  });
});
