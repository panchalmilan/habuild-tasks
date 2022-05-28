import express, { Request, Response } from 'express';
import dotenv from 'dotenv';

import db from './db';
import dbQuery from './dbQuery';
import validateRank from './middlewares/validateRank';

dotenv.config();

const PORT: number | string = process.env.PORT || 4000;

const app = express();

const main = async () => {
  try {
    db();
    app.use(express.json());

    // create topic table
    app.post('/api/create_table/topic', async (req: Request, res: Response) => {
      try {
        const query = `
          CREATE TABLE IF NOT EXISTS topic (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) UNIQUE NOT NULL
          );
        `;
        const { ok, error, result } = await dbQuery(query);
        if (!ok) return res.status(400).json({ ok: false, error });
        return res.status(200).json({ ok: true, data: result });
      } catch (err) {
        return res.status(400).json({ ok: false, error: err.message });
      }
    });

    // create ranking table
    app.post(
      '/api/create_table/ranking',
      async (req: Request, res: Response) => {
        try {
          const query = `
          CREATE TABLE IF NOT EXISTS ranking (
            id SERIAL PRIMARY KEY,
            rank INT NOT NULL CHECK(1<=rank AND rank<=100),
            topic_id INT NOT NULL,
            CONSTRAINT fk_topic FOREIGN KEY(topic_id) REFERENCES topic(id) ON DELETE CASCADE
          );
        `;
          const { ok, error, result } = await dbQuery(query);
          if (!ok) return res.status(400).json({ ok: false, error });
          return res.status(200).json({ ok: true, data: result });
        } catch (err) {
          return res.status(400).json({ ok: false, error: err.message });
        }
      }
    );

    // create topic
    app.post(
      '/api/topic',
      validateRank,
      async (req: Request, res: Response) => {
        try {
          const { title, rank } = req.body;

          await dbQuery('BEGIN');
          const res1 = await dbQuery(`INSERT INTO topic(title) VALUES ($1);`, [
            title
          ]);
          if (!res1.ok) throw new Error(res1.error);
          const res2 = await dbQuery(
            `INSERT INTO ranking(rank, topic_id) 
            VALUES($2, (SELECT id FROM topic WHERE title=$1));`,
            [title, rank]
          );
          if (!res2.ok) throw new Error(res2.error);
          await dbQuery('COMMIT');

          return res.status(200).json({ ok: true, data: 'data inserted' });
        } catch (err) {
          await dbQuery('ROLLBACK');
          return res.status(400).json({ ok: false, error: err.message });
        }
      }
    );

    // get topic from id
    app.get('/api/topic/:id', async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { ok, error, result } = await dbQuery(
          ` SELECT topic.id, title, rank 
          FROM topic 
          JOIN ranking
            ON ranking.topic_id=$1;
         `,
          [id]
        );
        if (result?.rowCount == 0)
          throw new Error(`topic with id ${id} does not exists`);
        if (!ok) return res.status(400).json({ ok: false, error });
        return res.status(200).json({ ok: true, data: result?.rows[0] });
      } catch (err) {
        return res.status(400).json({ ok: false, error: err.message });
      }
    });

    // update rank
    app.put(
      '/api/topic/',
      validateRank,
      async (req: Request, res: Response) => {
        try {
          const { title, rank } = req.body;
          const { ok, error, result } = await dbQuery(
            ` UPDATE ranking
              SET rank=$2
              WHERE topic_id = (SELECT id FROM topic WHERE title=$1);`,
            [title, rank]
          );
          if (result?.rowCount == 0)
            throw new Error(`topic with title ${title} does not exists`);
          if (!ok) return res.status(400).json({ ok: false, error });
          return res.status(200).json({ ok: true, data: result });
        } catch (err) {
          return res.status(400).json({ ok: false, error: err.message });
        }
      }
    );

    app.listen(4000, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {}
};

main();
