import { render, screen, waitFor } from '@testing-library/react';
import { TeamPage } from './TeamPage';

describe('TeamPage', () => {
  it('renders users from the API', async () => {
    globalThis.fetch = vi.fn((input: RequestInfo) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url.includes('/users') && !url.includes('POST')) {
        return Promise.resolve(
          new Response(
            JSON.stringify([
              {
                id: 'u-1',
                tenantId: 't-1',
                email: 'teacher@demo.test',
                role: 'TEACHER',
                isActive: true,
                lastLoginAt: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              },
            ]),
            { status: 200 },
          ),
        );
      }
      return Promise.resolve(new Response('{}', { status: 404 }));
    }) as typeof fetch;

    render(<TeamPage />);

    await waitFor(() => {
      expect(screen.getByText('teacher@demo.test')).toBeInTheDocument();
    });
  });
});
