import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import router from './routes.js';

//.env config
dotenv.config();

//cors to connect to frontend
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
};

const app = express();

app.use(express.json()); //json middleware to parse json object in req body
app.use(cors(corsOptions));
app.use(router);

const PORT = process.env.VITE_PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
