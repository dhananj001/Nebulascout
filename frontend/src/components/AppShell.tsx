'use client';

import { useState } from 'react';
import { Navigation } from './Navigation';
import { NewRunModal } from './NewRunModal';
import { useRouter } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isNewRunOpen, setIsNewRunOpen] = useState(false);
  const router = useRouter();

  return (
    <div suppressHydrationWarning className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <Navigation onOpenNewRun={() => setIsNewRunOpen(true)} />
      <main className="flex-1 min-w-0 overflow-y-auto bg-[var(--background)] transition-colors duration-200">
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
