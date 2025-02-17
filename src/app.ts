import express, { Request, Response, NextFunction } from 'express';
import apiRouter from './routes/apis.js';

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Routes
app.use('/wallet', apiRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
    console.log(req.body)
    res.send('Hello, World!');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
    next();
});

export default app;