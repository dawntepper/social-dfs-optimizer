// Simple in-memory database implementation
class InMemoryDB {
  private static instance: InMemoryDB;
  private data: Map<string, any[]>;

  private constructor() {
    this.data = new Map();
  }

  static getInstance(): InMemoryDB {
    if (!InMemoryDB.instance) {
      InMemoryDB.instance = new InMemoryDB();
    }
    return InMemoryDB.instance;
  }

  async insert(table: string, values: any) {
    if (!this.data.has(table)) {
      this.data.set(table, []);
    }
    const id = Math.random().toString(36).substr(2, 9);
    const record = { id, ...values, timestamp: Date.now() };
    this.data.get(table)?.push(record);
    return record;
  }

  async select(table: string) {
    return this.data.get(table) || [];
  }

  async query(table: string, filter: (item: any) => boolean) {
    const items = this.data.get(table) || [];
    return items.filter(filter);
  }
}

export const db = InMemoryDB.getInstance();

// Export a function to get the database instance
export async function query(sql: string, params: any[] = []) {
  // This is a simplified query function that just returns an empty array
  // In a real implementation, you'd want to parse the SQL and execute it
  return [];
}