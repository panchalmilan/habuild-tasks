import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

type jwtVerifiedData = {
  id: number;
  username: string;
  firstname: string;
  iat: number;
  exp: number;
};

const verifyToken = async (req, res: Response, next: NextFunction) => {
  try {
    const token = req.header('X-JWT');
    if (!token) throw new Error('token not provided');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    const user = decodedToken as jwtVerifiedData;
    req.user = user;
    return next();
  } catch (err) {
    res.status(400).json({ ok: false, error: err.message });
  }
};

export default verifyToken;
