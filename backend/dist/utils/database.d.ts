import { Database } from 'sqlite';
export declare function getDatabase(): Promise<Database>;
export declare function initializeDatabase(): Promise<void>;
export declare function closeDatabase(): Promise<void>;
export declare function query(sql: string, params?: any[]): Promise<any[]>;
//# sourceMappingURL=database.d.ts.map