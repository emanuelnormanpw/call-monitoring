import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import SentimentBadge from '../SentimentBadge';

describe('SentimentBadge', () => {
  it('treats a score exactly on the threshold as satisfied', () => {
    render(<SentimentBadge score={70} />);

    expect(screen.getByText('70.0%')).toBeInTheDocument();
    expect(screen.getByText('Satisfied')).toBeInTheDocument();
  });

  it('treats a score just below the threshold as needing review', () => {
    render(<SentimentBadge score={69.9} />);

    expect(screen.getByText('69.9%')).toBeInTheDocument();
    expect(screen.getByText('Needs Review')).toBeInTheDocument();
  });

  it('renders the score with a single decimal', () => {
    render(<SentimentBadge score={30.25} />);

    expect(screen.getByText('30.3%')).toBeInTheDocument();
  });

  it('colours the badge by outcome', () => {
    const { rerender } = render(<SentimentBadge score={92.3} />);

    expect(screen.getByText('92.3%').className).toContain('bg-success-soft');

    rerender(<SentimentBadge score={45} />);

    expect(screen.getByText('45.0%').className).toContain('bg-danger-soft');
  });
});
