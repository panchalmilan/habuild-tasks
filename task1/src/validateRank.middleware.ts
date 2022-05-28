import { NextFunction, Request, Response } from 'express';

const validateRank = (req: Request, res: Response, next: NextFunction) => {
  const { rank } = req.body;
  if (1 <= rank && rank <= 100) return next();
  return res
    .status(400)
    .json({ ok: false, error: 'rank should be between 1 and 100.' });
};

export default validateRank;
