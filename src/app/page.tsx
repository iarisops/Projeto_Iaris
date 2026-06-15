// Placeholder root — will be replaced by (app)/page.tsx in T047 (US4 dashboard)
// Authentication is enforced by src/middleware.ts
import AppShell from '@/components/layout/AppShell'

export default function RootPage() {
  return (
    <AppShell>
      <div className="p-8 flex flex-col gap-2">
        <h1 className="font-headline text-2xl font-semibold text-text-primary">IARIS Portfolio OS</h1>
        <p className="text-text-secondary">Dashboard em construção (T047).</p>
      </div>
    </AppShell>
  )
}
