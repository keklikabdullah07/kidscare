import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TactileDateNavigator } from './TactileDateNavigator';

describe('TactileDateNavigator', () => {
  it('renders correctly with given date and handles day navigation', () => {
    const handleChange = vi.fn();
    render(<TactileDateNavigator value="2026-10-19" onChange={handleChange} mode="day" />);

    expect(screen.getByTestId('tactile-date-navigator')).toBeDefined();
    // Check previous day button
    const prevBtn = screen.getByLabelText('Önceki Gün');
    fireEvent.click(prevBtn);
    expect(handleChange).toHaveBeenCalledWith('2026-10-18');

    // Check next day button
    const nextBtn = screen.getByLabelText('Sonraki Gün');
    fireEvent.click(nextBtn);
    expect(handleChange).toHaveBeenCalledWith('2026-10-20');
  });

  it('handles week navigation correctly in week mode', () => {
    const handleChange = vi.fn();
    render(<TactileDateNavigator value="2026-10-19" onChange={handleChange} mode="week" />);

    expect(screen.getByText('Bu Hafta')).toBeDefined();
    const prevWeekBtn = screen.getByLabelText('Önceki Hafta');
    fireEvent.click(prevWeekBtn);
    expect(handleChange).toHaveBeenCalledWith('2026-10-12');

    const nextWeekBtn = screen.getByLabelText('Sonraki Hafta');
    fireEvent.click(nextWeekBtn);
    expect(handleChange).toHaveBeenCalledWith('2026-10-26');
  });

  it('triggers quick jump to today', () => {
    const handleChange = vi.fn();
    render(<TactileDateNavigator value="2025-01-01" onChange={handleChange} mode="day" />);

    const todayBtn = screen.getByText('Bugün');
    fireEvent.click(todayBtn);
    expect(handleChange).toHaveBeenCalled();
  });
});
