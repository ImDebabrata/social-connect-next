import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from "http";
import { initializeSocket } from './socket/socket';

// Load environment variables from .env file (if any)
dotenv.config();

const app=express();
const port=process.env.PORT||3001;
const server=createServer(app);

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.json({message:'Chat service is running'});
});

// Socket.io setup
initializeSocket(server);

server.listen(port,()=>{
    console.log(`Chat service is running on port ${port}`);
});