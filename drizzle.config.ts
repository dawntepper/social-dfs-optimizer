import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  driver: 'sql.js',
  dbCredentials: {
    url: ':memory:'
  }
} satisfies Config;