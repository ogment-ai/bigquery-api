import type { Request, Response, NextFunction } from 'express';

const API_KEY = process.env.API_KEY!

export function auth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  
  if (!token || token !== API_KEY) {
    return res.status(401).json({ message: 'Unauthorized user or API key is incorrect' });
  }

  next();
}
