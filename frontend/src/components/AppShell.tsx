'use client';

import { useState } from 'react';
import { Navigation } from './Navigation';
import { NewRunModal } from './NewRunModal';
import { useRouter } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isNewRunOpen, setIsNewRunOpen] = useState(false);
  const router = useRouter();

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-[#090B0E] text-slate-100">
      <Navigation onOpenNewRun={() => setIsNewRunOpen(true)} />
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>

      <NewRunModal
        isOpen={isNewRunOpen}
        onClose={() => setIsNewRunOpen(false)}
        onRunCreated={(runId) => {
          router.push('/runs');
        }}
      />
    </div>
  );
}
