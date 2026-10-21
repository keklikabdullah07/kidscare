import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AdaptiveScopeBadge } from './AdaptiveScopeBadge';

describe('AdaptiveScopeBadge', () => {
  it('renders classroom badge with label', () => {
    render(<AdaptiveScopeBadge type="classroom" label="Minik Adımlar" />);
    expect(screen.getByText('Minik Adımlar')).toBeInTheDocument();
  });

  it('renders student badge with label', () => {
    render(<AdaptiveScopeBadge type="student" label="Ada Yılmaz" />);
    expect(screen.getByText('Ada Yılmaz')).toBeInTheDocument();
  });

  it('renders subLabel when provided', () => {
    render(<AdaptiveScopeBadge type="classroom" label="Minik Adımlar" subLabel="Sınıfınız" />);
    expect(screen.getByText(/Sınıfınız/)).toBeInTheDocument();
  });
});
