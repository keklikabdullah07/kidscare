import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ResetPasswordPage } from './ResetPasswordPage';

function renderResetPassword(
  initialPath = '/reset-password?token=valid-token',
): ReturnType<typeof render> {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function mockFetchByUrl(handlers: Record<string, (init?: RequestInit) => Response>) {
  return vi.spyOn(global, 'fetch').mockImplementation((...args: unknown[]) => {
    const [input, init] = args as [string | URL | Request, RequestInit | undefined];
    const url = input instanceof globalThis.Request ? input.url : String(input);
    const path = new URL(url, 'http://localhost').pathname;
    const handler = handlers[path];
    if (handler) return Promise.resolve(handler(init));
    return Promise.resolve(new Response(JSON.stringify({ message: 'unhandled' }), { status: 500 }));
  });
}

describe('ResetPasswordPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders invalid state when token is missing', async () => {
    renderResetPassword('/reset-password');

    await waitFor(() => {
      expect(screen.getByText(/Geçersiz veya Süresi Dolmuş Bağlantı/i)).toBeInTheDocument();
    });
  });

  it('renders invalid state when backend rejects token', async () => {
    mockFetchByUrl({
      '/auth/verify-reset-token': () =>
        new Response(JSON.stringify({ valid: false, reason: 'EXPIRED' }), { status: 200 }),
    });

    renderResetPassword('/reset-password?token=expired-token');

    await waitFor(() => {
      expect(
        screen.getByText(/Bu şifre sıfırlama bağlantısının 15 dakikalık süresi dolmuş/i),
      ).toBeInTheDocument();
    });
  });

  it('renders password form when token is valid and updates successfully', async () => {
    const user = userEvent.setup();

    mockFetchByUrl({
      '/auth/verify-reset-token': () =>
        new Response(JSON.stringify({ valid: true, email: 'user@demo.test' }), { status: 200 }),
      '/auth/reset-password': () =>
        new Response(JSON.stringify({ success: true, message: 'Updated' }), { status: 200 }),
    });

    renderResetPassword('/reset-password?token=valid-token-123456');

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByText(/Yeni Şifre Belirleyin/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/user@demo.test/i)).toBeInTheDocument();

    const newPassInput = screen.getByLabelText(/^Yeni Şifre$/i);
    const confirmPassInput = screen.getByLabelText(/^Yeni Şifre Tekrarı$/i);
    const submitBtn = screen.getByRole('button', { name: /Şifremi Güncelle/i });

    // Try short password
    await user.type(newPassInput, '1234');
    await user.type(confirmPassInput, '1234');
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Şifreniz en az 8 karakter uzunluğunda olmalıdır/i),
    ).toBeInTheDocument();

    // Fix length but mismatch
    await user.clear(newPassInput);
    await user.clear(confirmPassInput);
    await user.type(newPassInput, 'NewPassword123!');
    await user.type(confirmPassInput, 'Different123!');
    await user.click(submitBtn);

    expect(
      await screen.findByText(/Girdiğiniz şifreler birbiriyle eşleşmiyor/i),
    ).toBeInTheDocument();

    // Fix mismatch
    await user.clear(confirmPassInput);
    await user.type(confirmPassInput, 'NewPassword123!');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Şifreniz Güncellendi!/i)).toBeInTheDocument();
    });
  });
});
