const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const db = require('./helpers/db');

const app = express();
const webhookMiddleware = require('x-hub-signature').middleware;
const schedule = require('node-schedule');

const Notification = require('./helpers/notification');
const SisFetcher = require('./fetchers/sis');

const ruleFetcher = new schedule.RecurrenceRule();

const notification = new Notification();
const fetcher = new SisFetcher();

ruleFetcher.minute = new schedule.Range(0, 59, 1);

// Load the variables in .env file to the process.env
dotenv.config();

// Connect to the db and listen if success
db
  .connect()
  .on('error', console.error)
  .on('disconnected', db.connect)
  .once('open', () => {
    app.listen(process.env.APP_PORT);
    console.log(`Listening on port: ${process.env.APP_PORT}`);
  });

// Configure Middlewares
app.use(morgan(process.env.LOGGING_LEVEL || 'tiny'));
app.use(bodyParser.json());

// Configure Routes
app.use('/', require('./routes/index'));
app.use(
  '/webhook',
  require('./routes/webhook'),
  webhookMiddleware({
    algorithm: 'sha1',
    secret: process.env.PAGE_TOKEN,
    require: true,
    bodyParser: bodyParser.json, // DO NOT INVOKE HERE! e.g. bodyParser.json()
    bodyParserOptions: {},
  }),
);

app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status);
  }
  res.json({
    code: err.alias,
    message: err.message,
    messages: err.messages,
  });
  next(err);
});

schedule.scheduleJob(ruleFetcher, () => {
  fetcher.fetchAndSave({});

  setTimeout(() => notification.notificationToAll(), 90000);
});
