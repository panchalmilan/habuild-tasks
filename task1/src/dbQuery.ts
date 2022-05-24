import { QueryResult } from 'pg';
import { client } from './db';

interface IQueryResponse {
  ok: boolean;
  error?: string;
  result?: QueryResult<any>;
}

const dbQuery = async (
  queryText: string,
  values?: Array<any>
): Promise<IQueryResponse> => {
  try {
    const result = await client.query(queryText, values);
    return { ok: true, result };
  } catch (error) {
    return { ok: false, error: error.message };
  }
};

export default dbQuery;
