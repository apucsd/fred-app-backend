import { createServer, Server as HTTPServer } from 'http';
import app from './app';
import seedSuperAdmin from './app/DB';
import config from './config';
import { initSocket } from './app/utils/socket';
// import { initRedis } from './app/utils/redis.client';

const port = config.port || 5000;

async function main() {
    try {
        // await initRedis();
        const server: HTTPServer = createServer(app);
        
        server.listen(port, () => {
            console.log('Server is running on port ', port);
            seedSuperAdmin();
        });

        const io = initSocket(server);

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('register', (userId: string) => {
                socket.join(userId);
                console.log(`User ${userId} joined their personal room`);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        const exitHandler = () => {
            if (server) {
                server.close(() => {
                    console.info('Server closed!');
                });
            }
            process.exit(1);
        };

        process.on('uncaughtException', (error) => {
            console.log(error);
            exitHandler();
        });

        process.on('unhandledRejection', (error) => {
            console.log(error);
            exitHandler();
        });

    } catch (error) {
        console.error('❌ Server startup failed:', error);
        process.exit(1);
    }
}

main();
