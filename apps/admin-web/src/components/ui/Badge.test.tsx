import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './Badge';

describe('Badge Component', () => {
  it('renders children correctly', () => {
    render(<Badge variant="success">Tamamlandı</Badge>);
    expect(screen.getByText('Tamamlandı')).toBeInTheDocument();
  });

  it('renders dot indicator when enabled', () => {
    const { container } = render(
      <Badge variant="warning" dot>
        Bekliyor
      </Badge>,
    );
    expect(container.querySelector('.rounded-full.shrink-0')).toBeInTheDocument();
  });
});
