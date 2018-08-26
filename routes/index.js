const express = require('express');
const Notification = require('../helpers/notification');
const SisFetcher = require('../fetchers/sis');
const FacebookHelper = require('../helpers/facebook');
const User = require('../models/User');


const router = express.Router();

router.get('/', (req, res) => {
  /*if (process.env.VERIFY_TOKEN !== req.query.verify_token) {
    res.sendStatus(404).end();
  } else {
    res.send('Root').end();
  }*/
  res.set('Content-Type', 'application/json');
  res.send({
    "test": "json"
  }).end();
});

router.get('/sis', (req, res) => {
  if (process.env.VERIFY_TOKEN !== req.query.verify_token) {
    res.sendStatus(404).end();
  } else {
    const g = new SisFetcher();
    g.fetchAndSave({}, (err, data) => {
      res.json({
        err,
        data
      });
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

router.post('/sendmessage', async (req, res) => {
  if (process.env.VERIFY_TOKEN !== req.query.verify_token) {
    res.sendStatus(404).end();
  } else {
    const message = req.body.message;
    try {
      const users = await User.find({});
      users.map((user, index) => {
        console.log(user)
        setTimeout(
          FacebookHelper.sendTextMessage(user.facebookId, message), index * 200)
      })

    } catch (e) {
      console.error(e);
    }





  }


})

module.exports = router;