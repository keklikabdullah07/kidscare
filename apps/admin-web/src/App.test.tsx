import { render, screen, waitFor } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('shows the login page when no token is stored', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'no token' }), { status: 401 }),
    );

    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /giriş/i })).toBeInTheDocument();
    });
  });
});
