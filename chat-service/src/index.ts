import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from "http";
import { initializeSocket, prisma } from './socket/socket';

// Load env from the service's own .env, then fall back to the repo-root .env
// (which holds JWT_SECRET / POSTGRES_PRISMA_URL shared with the web app).
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app=express();
const port=process.env.PORT||3001;
const server=createServer(app);

// Only allow the web app origin; required for cookie-based auth (credentials).
const allowedOrigin = process.env.APP_URL || "http://localhost:3000";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

app.get('/',(req,res)=>{
    res.json({message:'Chat service is running'});
});

app.get('/health',(req,res)=>{
    res.json({status:'ok'});
});

// Socket.io setup
const io = initializeSocket(server);

server.listen(port,()=>{
    console.log(`Chat service is running on port ${port}`);
});

// Graceful shutdown so in-flight sockets and DB connections close cleanly.
const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);
    // Force-exit if things don't drain in time.
    setTimeout(() => process.exit(1), 10_000).unref();
    // io.close() also closes the underlying HTTP server and disconnects clients.
    io.close(async () => {
        await prisma.$disconnect();
        process.exit(0);
    });
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));