import { Pool } from 'postgresql-client';

export class BaseDatasource {
  constructor(protected pool: Pool) {}

  async execQuery(query: string, params: any[] = []): Promise<any[]> {
    console.debug('Query', query, params);
    const result = await this.pool.query(query, {
      params,
      objectRows: true,
    });
    console.debug('Results', result.rows);
    return result.rows!;
  }
}
