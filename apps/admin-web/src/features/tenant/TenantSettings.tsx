import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import type { Tenant } from '@kidscare/shared-types';
import { ApiError } from '../../api/client';
import { getTenantMe, updateTenantMe } from '../../api/tenants';

type Status = 'loading' | 'ready' | 'error';

export function TenantSettings(): JSX.Element {
  const [status, setStatus] = useState<Status>('loading');
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTenantMe()
      .then((t) => {
        if (cancelled) return;
        setTenant(t);
        setName(t.name);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Unknown error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!tenant || saving || name === tenant.name) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const updated = await updateTenantMe(name);
      setTenant(updated);
      setName(updated.name);
    } catch (err: unknown) {
      setErrorMsg(err instanceof ApiError ? `API ${err.status}` : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return <p className="text-gray-500">Yükleniyor…</p>;
  }
  if (status === 'error') {
    return (
      <div className="bg-white rounded-lg shadow p-6 space-y-3">
        <h1 className="text-xl font-semibold text-gray-900">Kreş ayarları</h1>
        <p role="alert" className="text-red-600">
          Hata: {errorMsg}
        </p>
        <p className="text-sm text-gray-600">
          API çalışıyor mu? <code>pnpm --filter @kidscare/api start:dev</code>
        </p>
      </div>
    );
  }
  if (!tenant) return <></>;

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Kreş ayarları</h1>

      <dl className="grid grid-cols-3 gap-4 text-sm">
        <dt className="text-gray-500">Slug</dt>
        <dd className="col-span-2">
          <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800">{tenant.slug}</code>
        </dd>

        <dt className="text-gray-500">Durum</dt>
        <dd className="col-span-2">
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">
            {tenant.status}
          </span>
        </dd>

        <dt className="text-gray-500">Oluşturuldu</dt>
        <dd className="col-span-2 text-gray-700">
          {new Date(tenant.createdAt).toLocaleString('tr-TR')}
        </dd>
      </dl>

      <form
        onSubmit={(e) => void handleSave(e)}
        className="space-y-3 border-t border-gray-100 pt-4"
      >
        <label className="block">
          <span className="block text-sm font-medium text-gray-700 mb-1">Ad</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            minLength={2}
            maxLength={128}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || name === tenant.name}
            className="bg-blue-600 text-white rounded px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
          {name !== tenant.name && <span className="text-xs text-gray-500">Değişiklik var</span>}
        </div>
        {errorMsg && (
          <p role="alert" className="text-sm text-red-600">
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}
