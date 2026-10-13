# Web Paneli Mobil Tarayıcı Deneyimi (Mobile Responsive Experience) Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** KidsCare web yönetim paneline (`apps/admin-web`) akıllı telefon tarayıcılarında (iPhone Safari / Android Chrome, 360-430px) yerel uygulama akıcılığı kazandıran rol bazlı alt navigasyon barı (Bottom Nav Bar), tablo-kart dönüşümü ve dokunmatik ergonomi eklemek.

**Architecture:** `<MobileBottomNav />` bileşeni ile rol bazlı 4 ana sekme + sol çekmeceyi açan "Menü" butonu eklenir; `<main>` alanına `pb-24` alt tamponu verilir. `StudentsPage` ve `AttendancePage` sayfalarındaki geniş masaüstü tabloları mobilde (`< 768px`) dikey dokunsal kart bloklarına dönüştürülür.

**Tech Stack:** React 19, React Router 7, TailwindCSS 4, Lucide React, Vitest, Testing Library.

## Global Constraints

- Monorepo: `apps/admin-web`
- Yalnızca web paneli kapsamındadır; mobil uygulama (`apps/mobile`) koduna DOKUNULMAYACAKTIR.
- Dokunsal Sistem: `#115e59` Zümrüt/Adaçayı, `#FAF9F6` parlamayan keten zemin, 3D alt dudak gölgeleri korunmalıdır.
- Sıfır yatay kayma (horizontal scrollbar = 0).
- Tüm dokunma hedefleri minimum 44px (`min-h-[44px] min-w-[44px]`).

---

### Task 1: Mobil Alt Navigasyon Barı Bileşeni (`MobileBottomNav.tsx`)

**Files:**

- Create: `apps/admin-web/src/components/navigation/MobileBottomNav.tsx`
- Create: `apps/admin-web/src/components/navigation/MobileBottomNav.test.tsx`

**Interfaces:**

- Consumes: `useAuth` (`role`), `NavLink` (react-router-dom)
- Produces: `<MobileBottomNav onOpenMenu={() => void} />`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { MobileBottomNav } from './MobileBottomNav';

describe('MobileBottomNav', () => {
  it('renders admin tabs and triggers menu toggle on click', () => {
    const onOpenMenu = vi.fn();
    render(
      <MemoryRouter>
        <MobileBottomNav role="ADMIN" onOpenMenu={onOpenMenu} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Gösterge')).toBeDefined();
    expect(screen.getByText('Öğrenciler')).toBeDefined();
    expect(screen.getByText('Yoklama')).toBeDefined();
    expect(screen.getByText('İlaç')).toBeDefined();
    const menuBtn = screen.getByText('Menü');
    menuBtn.click();
    expect(onOpenMenu).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @kidscare/admin-web test MobileBottomNav.test.tsx`
Expected: FAIL ("MobileBottomNav not found")

- [ ] **Step 3: Write minimal implementation**

Create `apps/admin-web/src/components/navigation/MobileBottomNav.tsx`:

```tsx
import type { JSX } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckCircle2,
  BookOpenCheck,
  Pill,
  ShieldCheck,
  MessageSquare,
  Home,
  Menu,
  type LucideIcon,
} from 'lucide-react';

interface BottomNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  role: string;
  onOpenMenu: () => void;
}

function getTabsForRole(role: string): BottomNavItem[] {
  if (role === 'PARENT') {
    return [
      { to: '/portal', label: 'Portal', icon: Home },
      { to: '/medication', label: 'İlaç', icon: Pill },
      { to: '/pickup', label: 'Teslimat', icon: ShieldCheck },
      { to: '/messages', label: 'Mesajlar', icon: MessageSquare },
    ];
  }

  if (role === 'TEACHER') {
    return [
      { to: '/dashboard', label: 'Akış', icon: LayoutDashboard },
      { to: '/attendance', label: 'Yoklama', icon: CheckCircle2 },
      { to: '/tracking', label: 'Karne', icon: BookOpenCheck },
      { to: '/medication', label: 'İlaç', icon: Pill },
    ];
  }

  // ADMIN / SUPER_ADMIN
  return [
    { to: '/dashboard', label: 'Gösterge', icon: LayoutDashboard },
    { to: '/students', label: 'Öğrenciler', icon: Users },
    { to: '/attendance', label: 'Yoklama', icon: CheckCircle2 },
    { to: '/medication', label: 'İlaç', icon: Pill },
  ];
}

export function MobileBottomNav({ role, onOpenMenu }: MobileBottomNavProps): JSX.Element {
  const tabs = getTabsForRole(role);

  return (
    <nav
      aria-label="Mobil Alt Menü"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FCFAF7]/95 dark:bg-[#0D1524]/95 backdrop-blur-xl border-t border-[#E8E2D5] dark:border-slate-800 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 min-w-[56px] min-h-[48px] py-1 rounded-2xl transition-all duration-150 ${
                  isActive
                    ? 'text-teal-900 dark:text-teal-300 font-bold scale-105'
                    : 'text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-xl transition-all ${
                      isActive ? 'bg-teal-100/80 dark:bg-teal-950/60 shadow-2xs' : ''
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] leading-tight tracking-tight mt-0.5">
                    {tab.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Tüm Menüyü Aç"
          className="flex flex-col items-center justify-center flex-1 min-w-[56px] min-h-[48px] py-1 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition-all"
        >
          <div className="p-1 rounded-xl">
            <Menu className="w-5 h-5" />
          </div>
          <span className="text-[11px] leading-tight tracking-tight mt-0.5">Menü</span>
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @kidscare/admin-web test MobileBottomNav.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/admin-web/src/components/navigation/
git commit -m "feat(web): add MobileBottomNav component with role-based tabs and safe area support"
```

---

### Task 2: Layout Entegrasyonu (`Layout.tsx`)

**Files:**

- Modify: `apps/admin-web/src/components/Layout.tsx`

- [ ] **Step 1: Entegrate MobileBottomNav into Layout**
  - Import `MobileBottomNav`.
  - Render `<MobileBottomNav role={userRole} onOpenMenu={() => setMobileOpen(true)} />` at the bottom of `Layout`.
  - Add `pb-24` to `<main>` so content is never obscured by the bottom bar.

- [ ] **Step 2: Run web tests**
      Run: `pnpm --filter @kidscare/admin-web test`
      Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/admin-web/src/components/Layout.tsx
git commit -m "feat(web): integrate MobileBottomNav into layout with responsive bottom padding"
```

---

### Task 3: Öğrenci Yönetimi (`StudentsPage.tsx`) Mobil Dokunsal Kart Dönüşümü

**Files:**

- Modify: `apps/admin-web/src/features/students/StudentsPage.tsx`

- [ ] **Step 1: Add mobile card view**
  - Wrap desktop table inside `hidden md:block` / `hidden md:table`.
  - Add `md:hidden flex flex-col gap-3.5` list containing compact tactile cards (`TactileCard`) for each student.
  - Card displays avatar, full name, age, classroom badge, allergy warning badges, parent phone link (`tel:`), and quick actions (Pasaport & Düzenle).

- [ ] **Step 2: Verify zero horizontal overflow**
  - Verify that no elements have fixed pixel widths exceeding 340px.

- [ ] **Step 3: Run web tests**
      Run: `pnpm --filter @kidscare/admin-web test`
      Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/admin-web/src/features/students/StudentsPage.tsx
git commit -m "feat(web): transform students table into tactile card view on mobile viewports"
```

---

### Task 4: Yoklama Ekranı (`AttendancePage.tsx`) Mobil Kart & 44px Dokunsal Butonlar

**Files:**

- Modify: `apps/admin-web/src/features/attendance/AttendancePage.tsx`

- [ ] **Step 1: Add mobile attendance card block**
  - Wrap desktop table inside `hidden md:block` / `hidden md:table`.
  - Add `md:hidden flex flex-col gap-3` block:
    - Student avatar, name, and allergy badge.
    - Large 3-way segment buttons: **Geldi**, **Gelmedi**, **İzinli** with minimum 44px height (`min-h-[44px]`).
    - Note input and save button easily reachable with one thumb.

- [ ] **Step 2: Run web tests**
      Run: `pnpm --filter @kidscare/admin-web test`
      Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add apps/admin-web/src/features/attendance/AttendancePage.tsx
git commit -m "feat(web): provide mobile-first tactile attendance cards with 44px touch targets"
```

---

### Task 5: Modal Ekran Taşma Koruması & Genel Kalite Kapısı Doğrulaması

**Files:**

- Modify: `apps/admin-web/src/components/ui/PromptModal.tsx`
- Modify: `apps/admin-web/src/features/students/StudentPassportModal.tsx`

- [ ] **Step 1: Apply `max-h-[90vh]` and `overflow-y-auto`**
  - Ensure modals never exceed 90% of screen height and remain scrollable on small mobile viewports.

- [ ] **Step 2: Run full verification gate**
      Run: `./scripts/check.ps1`
      Expected: 100% PASS (TypeScript, Lint, Tests).

- [ ] **Step 3: Commit**

```bash
git add apps/admin-web/src/components/ui/PromptModal.tsx apps/admin-web/src/features/students/StudentPassportModal.tsx
git commit -m "feat(web): enforce mobile modal max-height and scrollable boundaries"
```
