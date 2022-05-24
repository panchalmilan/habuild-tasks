import { Client, ClientConfig } from 'pg';

const dbConnectionOptions: ClientConfig = {
  database: 'habuild-server',
  host: process.env.DB_ENDPOINT,
  port: 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
};

export const client = new Client(dbConnectionOptions);

const db = async () => {
  try {
    await client.connect();
    console.log('Connected to Postgres');
  } catch (error) {
    throw new Error('Unable to connect to Postgres');
  }
};

export default db;
