import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActivityGalleryPage } from './ActivityGalleryPage';

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    state: {
      status: 'authenticated',
      user: {
        id: 'admin-1',
        tenantId: 't-1',
        email: 'admin@demo.test',
        role: 'ADMIN',
      },
      token: 'test-jwt',
    },
    login: async () => {},
    signup: async () => {},
    logout: () => {},
  }),
}));

const fakeActivities = [
  {
    id: 'act-1',
    tenantId: 't-1',
    authorId: 'u-1',
    title: 'Sulu Boya Atölyesi',
    description: 'Çocuklarla renkli resimler yaptık.',
    classroom: 'Papatyalar Sınıfı',
    activityDate: '2026-10-04T09:00:00.000Z',
    mediaUrls: [
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop',
    ],
    tags: ['Sanat', 'Resim'],
    createdAt: '2026-10-04T09:00:00.000Z',
    updatedAt: '2026-10-04T09:00:00.000Z',
  },
];

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

describe('ActivityGalleryPage', () => {
  beforeEach(() => {
    localStorage.setItem('kidscare.token', 'test-jwt');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders gallery title and activity cards', async () => {
    mockFetchByUrl({
      '/activities': () =>
        new Response(JSON.stringify(fakeActivities), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    });

    render(<ActivityGalleryPage />);

    expect(await screen.findByText('Fotoğraf & Etkinlik Galerisi')).toBeInTheDocument();
    expect(await screen.findByText('Sulu Boya Atölyesi')).toBeInTheDocument();
    expect(screen.getByText('Papatyalar Sınıfı')).toBeInTheDocument();
    expect(screen.getByText('Çocuklarla renkli resimler yaptık.')).toBeInTheDocument();
  });

  it('opens and closes create activity modal', async () => {
    mockFetchByUrl({
      '/activities': () =>
        new Response(JSON.stringify([]), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    });

    render(<ActivityGalleryPage />);

    const openBtn = await screen.findByRole('button', { name: /Yeni Etkinlik & Fotoğraf Paylaş/i });
    await userEvent.click(openBtn);

    expect(screen.getByText('Etkinlik Başlığı *')).toBeInTheDocument();
    // Eski üst upload zone kaldırıldı; tek yükleme noktası URL satırındaki Dosya butonu.
    expect(screen.queryByText('Cihazınızdan Fotoğraf Yükleyin')).not.toBeInTheDocument();
    expect(screen.getByText("Veya Doğrudan Görsel URL'si Ekle")).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /İptal/i });
    await userEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Etkinlik Başlığı *')).not.toBeInTheDocument();
    });
  });

  it('opens LightboxModal when clicking a photo', async () => {
    mockFetchByUrl({
      '/activities': () =>
        new Response(JSON.stringify(fakeActivities), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
    });

    render(<ActivityGalleryPage />);

    const img = await screen.findByAltText('Sulu Boya Atölyesi Fotoğraf 1');
    await userEvent.click(img);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Yeni Sekmede Aç')).toBeInTheDocument();
    expect(screen.getByText('İndir')).toBeInTheDocument();

    const closeBtn = screen.getByTitle('Kapat (ESC)');
    await userEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('Dosya butonu URL satırında file picker tetikler', async () => {
    mockFetchByUrl({
      '/activities': () => new Response(JSON.stringify([]), { status: 200 }),
    });

    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');

    render(<ActivityGalleryPage />);

    const openBtn = await screen.findByRole('button', {
      name: /Yeni Etkinlik & Fotoğraf Paylaş/i,
    });
    await userEvent.click(openBtn);

    // URL satırındaki "Dosfa" butonu (üst zone "Dosya Seç" diye geçiyor)
    const urlFileBtn = screen
      .getAllByRole('button', { name: /Dosya/i })
      .find((b) => b.title === 'Cihazınızdan fotoğraf yükle');
    expect(urlFileBtn).toBeDefined();
    await userEvent.click(urlFileBtn!);

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
