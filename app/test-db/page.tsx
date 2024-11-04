'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export default function TestDbPage() {
  const [status, setStatus] = useState<string>('Testing connection...');

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('players').select('count');
        
        if (error) {
          throw error;
        }

        setStatus('Connected to Supabase successfully!');
      } catch (error) {
        console.error('Database connection error:', error);
        setStatus(`Connection error: ${error.message}`);
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <p className="text-lg">{status}</p>
    </div>
  );
}