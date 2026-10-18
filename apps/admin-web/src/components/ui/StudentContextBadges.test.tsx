import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StudentContextBadges } from './StudentContextBadges';

describe('StudentContextBadges', () => {
  it('renders nothing when all props are missing', () => {
    const { container } = render(<StudentContextBadges />);
    expect(container.firstChild).toBeNull();
  });

  it('renders classroom, teacher, and parent badges correctly', () => {
    render(
      <StudentContextBadges
        classroomName="Papatyalar Sınıfı"
        teacherName="Zeynep Öğretmen"
        parentName="Selin Yılmaz"
      />,
    );

    expect(screen.getByText('Papatyalar Sınıfı')).toBeInTheDocument();
    expect(screen.getByText('Zeynep Öğretmen')).toBeInTheDocument();
    expect(screen.getByText('Selin Yılmaz')).toBeInTheDocument();
  });

  it('renders only available badges', () => {
    render(<StudentContextBadges classroomName="Kelebekler" />);
    expect(screen.getByText('Kelebekler')).toBeInTheDocument();
    expect(screen.queryByText('Öğretmen')).not.toBeInTheDocument();
  });
});
