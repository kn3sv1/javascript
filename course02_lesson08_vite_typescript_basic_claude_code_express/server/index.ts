import express from 'express';
import jsonServer from 'json-server';

const app = express();
const PORT = 4000;

const apiRouter = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

app.use(middlewares);
app.use(jsonServer.bodyParser);
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Express + json-server API running on http://localhost:${PORT}/api`);
});
