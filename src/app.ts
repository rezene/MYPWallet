import express, { Request, Response, NextFunction } from 'express';
import apiRouter from './controller/BitcoinController.js';
import cors from 'cors';
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
app.use(cors({
    origin: 'http://localhost:5173' 
}));
// Routes
app.use('/wallet', apiRouter);

// Root route
app.get('/', (req: Request, res: Response) => {
    console.log(req.body)
    res.send('Wallet server is running');
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(req.body)
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
    next();
});

export default app;