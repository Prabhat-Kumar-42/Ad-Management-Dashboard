import express from 'express';
import dotenv from 'dotenv';
import {} from './controllers/auth.controller.js';
import { appRouter } from './routes/app.routes.js';

// /server/app.ts

dotenv.config();

export const app = express();

app.use(express.json());

// all routes
// prefixed with /api
app.use('/api', appRouter)

app.get('/healthz', (req, res) => {
  res.send('fit and fat !! :D');
});

