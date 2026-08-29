import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import Toolbar from '../Toolbar';
import type { PropsType } from '../types';

const MIN_DATE = '2026-05-30';
const MAX_DATE = '2026-08-30';

const renderToolbar = (overrides: Partial<PropsType> = {}) => {
  const handlers = {
    onSearchChange: vi.fn(),
    onClearSearch: vi.fn(),
    onSentimentChange: vi.fn(),
    onStartDateChange: vi.fn(),
    onEndDateChange: vi.fn(),
  };

  const props: PropsType = {
    search: '',
    sentiment: 'all',
    startDate: '',
    endDate: '',
    minDate: MIN_DATE,
    maxDate: MAX_DATE,
    ...handlers,
    ...overrides,
  };

  render(<Toolbar {...props} />);

  return handlers;
};

describe('Toolbar', () => {
  it('labels every filter field', () => {
    renderToolbar();

    expect(screen.getByLabelText('Pencarian')).toBeInTheDocument();
    expect(screen.getByLabelText('Sentimen')).toBeInTheDocument();
    expect(screen.getByLabelText('Tanggal Awal')).toBeInTheDocument();
    expect(screen.getByLabelText('Tanggal Akhir')).toBeInTheDocument();
  });

  it('limits both period inputs to the allowed window', () => {
    renderToolbar();

    const startDate = screen.getByLabelText('Tanggal Awal');
    const endDate = screen.getByLabelText('Tanggal Akhir');

    expect(startDate).toHaveAttribute('min', MIN_DATE);
    expect(startDate).toHaveAttribute('max', MAX_DATE);
    expect(endDate).toHaveAttribute('min', MIN_DATE);
    expect(endDate).toHaveAttribute('max', MAX_DATE);
  });

  it('keeps the two period bounds from crossing over', () => {
    renderToolbar({ startDate: '2026-07-01', endDate: '2026-07-31' });

    // The end date cannot go before the start date, and vice versa.
    expect(screen.getByLabelText('Tanggal Akhir')).toHaveAttribute(
      'min',
      '2026-07-01',
    );
    expect(screen.getByLabelText('Tanggal Awal')).toHaveAttribute(
      'max',
      '2026-07-31',
    );
  });

  it('offers every sentiment option and reports the chosen one', async () => {
    const user = userEvent.setup();
    const { onSentimentChange } = renderToolbar();

    const select = screen.getByLabelText('Sentimen');

    expect(screen.getAllByRole('option')).toHaveLength(3);

    await user.selectOptions(select, 'under_70');

    expect(onSentimentChange).toHaveBeenCalledWith('under_70');
  });

  it('reports what the user types into the search field', async () => {
    const user = userEvent.setup();
    const { onSearchChange } = renderToolbar();

    await user.type(screen.getByLabelText('Pencarian'), 'A');

    expect(onSearchChange).toHaveBeenCalledWith('A');
  });

  it('only shows the clear button once there is a keyword', async () => {
    const user = userEvent.setup();
    renderToolbar();

    expect(
      screen.queryByRole('button', { name: 'Bersihkan pencarian' }),
    ).not.toBeInTheDocument();

    const { onClearSearch } = renderToolbar({ search: 'Andi' });

    await user.click(
      screen.getByRole('button', { name: 'Bersihkan pencarian' }),
    );

    expect(onClearSearch).toHaveBeenCalledTimes(1);
  });
});
