import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import path from 'path';
import { StripeWebHook } from './app/utils/StripeUtils';
const app: Application = express();

app.post('/api/v1/webhook', express.raw({ type: 'application/json' }), StripeWebHook);

app.use(
    cors({
        origin: [
            'http://localhost:3001',
            'http://localhost:3000',
            'http://localhost:5173',
            'http://172.252.13.78:3014',
        ],
        credentials: true,
    })
);

//parser
app.use(express.json());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.json({
        status: 'running',
        message: 'Backend server is active and operational.',
        developer: {
            name: 'Apu Sutra Dhar',
            role: 'MERN Stack Developer / Backend Developer',
            location: 'Bangladesh',
            portfolio: 'https://apusutradhar.vercel.app/',
        },

        timestamp: new Date().toISOString(),
    });
});

app.use('/api/v1', router);

app.use(globalErrorHandler);
app.use('/upload', express.static(path.join(__dirname, 'app', 'upload')));
app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'API NOT FOUND!',
        error: {
            path: req.originalUrl,
            message: 'Your requested path is not found!',
        },
    });
});

export default app;
