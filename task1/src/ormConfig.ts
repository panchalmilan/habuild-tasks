import { DataSourceOptions } from 'typeorm';

const defaultConnectionOptions: DataSourceOptions = {
  type: 'postgres',
  database: 'habuild-server',
  synchronize: true,
  logging: process.env.DB_LOGGING === 'true',
  entities: ['entities/*.*'],
  host: process.env.DB_ENDPOINT,
  port: 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
};

export default defaultConnectionOptions;
