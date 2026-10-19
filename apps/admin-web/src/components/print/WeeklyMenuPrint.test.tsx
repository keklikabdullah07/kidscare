import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyMenuPrint } from './WeeklyMenuPrint';
import type { DailyMenuResponse } from '../../api/daily-menus';

describe('WeeklyMenuPrint', () => {
  it('renders official MEB weekly menu sheet with given days and meals', () => {
    const weekDays = [
      { dateStr: '2026-10-19', dayName: 'Pazartesi', dayNumber: 19, monthName: 'Eki' },
      { dateStr: '2026-10-20', dayName: 'Salı', dayNumber: 20, monthName: 'Eki' },
      { dateStr: '2026-10-21', dayName: 'Çarşamba', dayNumber: 21, monthName: 'Eki' },
      { dateStr: '2026-10-22', dayName: 'Perşembe', dayNumber: 22, monthName: 'Eki' },
      { dateStr: '2026-10-23', dayName: 'Cuma', dayNumber: 23, monthName: 'Eki' },
    ];

    const weekData: Record<string, DailyMenuResponse> = {
      '2026-10-19': {
        menu: {
          id: 'm-1',
          tenantId: 't-1',
          date: '2026-10-19',
          breakfast: ['Haşlanmış Yumurta', 'Beyaz Peynir', 'Zeytin'],
          lunch: ['Mercimek Çorbası', 'Sebzeli Köfte', 'Bulgur Pilavı'],
          snack: ['Mevsim Meyvesi', 'Süt'],
          allergens: ['Yumurta', 'Süt / Laktoz'],
          calories: 850,
          notes: '',
          createdAt: '',
          updatedAt: '',
        },
        allergenWarnings: [
          { studentId: 's-1', studentName: 'Ahmet', matchedAllergens: ['Yumurta'] },
        ],
      },
    };

    render(
      <WeeklyMenuPrint
        startDate="19.10.2026"
        endDate="23.10.2026"
        weekDays={weekDays}
        weekData={weekData}
      />,
    );

    expect(screen.getByTestId('weekly-menu-print')).toBeDefined();
    expect(screen.getByText('HAFTALIK YEMEK VE BESLENME ÇİZELGESİ')).toBeDefined();
    expect(screen.getByText(/Haşlanmış Yumurta/i)).toBeDefined();
    expect(screen.getByText(/Sebzeli Köfte/i)).toBeDefined();
    expect(screen.getByText(/850 kcal/i)).toBeDefined();
    expect(screen.getByText(/Yumurta, Süt \/ Laktoz/i)).toBeDefined();
    expect(screen.getByText('HAZIRLAYAN')).toBeDefined();
    expect(screen.getByText('ONAYLAYAN')).toBeDefined();
  });
});
