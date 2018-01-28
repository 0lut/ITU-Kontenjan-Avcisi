const schedule = require('node-schedule');
const Notification = require('./helpers/notification');
const SisFetcher = require('./fetchers/sis');

// const ruleFetcher = new schedule.RecurrenceRule();
const ruleFetcher = new schedule.RecurrenceRule();

const notification = new Notification();
const fetcher = new SisFetcher();

ruleFetcher.minute = new schedule.Range(0, 59, 1);

schedule.scheduleJob(ruleFetcher, () => {
  console.log('fetcher', new Date().getMinutes());
  setTimeout(() => console.log('Notification', new Date().getMinutes()), 90000);
});
