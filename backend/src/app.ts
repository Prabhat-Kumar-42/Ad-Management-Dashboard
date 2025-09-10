import express from 'express';
import dotenv from 'dotenv';
import {} from './controllers/auth.controller.js';
import { authRouter } from './routes/auth.routes.js';

// /src/app.ts

dotenv.config();

export const app = express();

app.use(express.json());

app.use('/auth', authRouter);

app.get('/healthz', (req, res) => {
  res.send('fit and fat !! :D');
});

