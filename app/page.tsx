'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Redirect to optimizer page
export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/optimizer');
  }, [router]);

  return null;
}