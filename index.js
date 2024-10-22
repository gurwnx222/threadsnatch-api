import express from 'express';
import cors from 'cors';
import threadsApiRouter from './routes/threads-api.js'; 

const app = express();
const port = 8080;

app.use(cors());

app.get('/', (req, res) => {
  res.send('ThreadSnatch API is Up and running!');
});

app.use('/', threadsApiRouter);

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});