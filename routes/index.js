const express = require('express');
const Notification = require('../helpers/notification');
const SisFetcher = require('../fetchers/sis');

const router = express.Router();

router.get('/', (req, res) => {
  if (process.env.VERIFY_TOKEN !== req.query.verify_token) {
    res.sendStatus(404).end();
  } else {
    res.send('Root').end();
  }
});

router.get('/sis', (req, res) => {
  if (process.env.VERIFY_TOKEN !== req.query.verify_token) {
    res.sendStatus(404).end();
  } else {
    const g = new SisFetcher();
    g.fetchAndSave({}, (err, data) => {
      res.json({ err, data });
    });
  }
});

router.get('/notification', (req, res) => {
  if (process.env.VERIFY_TOKEN !== req.query.verify_token) {
    res.sendStatus(404).end();
  } else {
    const g = new Notification();
    g.notificationToAll();
    res.send('notification');
  }
});

module.exports = router;
