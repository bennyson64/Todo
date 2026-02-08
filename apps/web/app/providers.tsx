"use client";

import { QueryClientProvider, queryClient } from "@/hooks/use-work-items";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
