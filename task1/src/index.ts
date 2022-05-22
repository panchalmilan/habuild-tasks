import express from 'express';
import dotenv from 'dotenv';

import ormConfig from './ormConfig';
import { DataSource } from 'typeorm';
import { User } from './entities/User';

dotenv.config();

const PORT: number | string = process.env.PORT || 4000;

const app = express();

const main = async () => {
  try {
    const AppDataSource = new DataSource(ormConfig);
    await AppDataSource.initialize();
    console.log('Connected to Postgres');

    app.use(express.json());

    console.log('Inserting a new user into the database...');
    const user = new User();
    user.firstName = 'Daniel';
    user.lastName = 'Craig';
    user.age = 50;
    await AppDataSource.manager.save(user);
    console.log('Saved a new user with id: ' + user.id);

    console.log('Loading users from the database...');
    const users = await AppDataSource.manager.find(User);
    console.log('Loaded users: ', users);

    app.listen(4000, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    throw new Error('Unable to connect to Postgres');
  }
};

main();
