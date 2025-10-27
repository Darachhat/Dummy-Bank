// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const invoicesRouter = require('./src/routes/invoices');
const authRouter = require('./src/routes/auth');
const usersRouter = require('./src/routes/users');
const transactionsRouter = require('./src/routes/transactions');
const accountsRouter = require('./src/routes/accounts');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

app.use('/api', invoicesRouter);
app.use('/api', transactionsRouter);
app.use('/api', accountsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Dummy Bank backend listening on http://localhost:${PORT}`);
});