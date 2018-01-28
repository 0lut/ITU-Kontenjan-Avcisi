// Creates the endpoint for our webhook
const FacebookHelper = require('../helpers/facebook');
const express = require('express');
const User = require('../models/User');

const router = express.Router();

router.post('/', (req, res) => {
  const body = { ...req.body };
  // console.log(body);

  // Checks this is an event from a page subscription
  if (body.object === 'page') {
    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach((entry) => {
      // Gets the message. entry.messaging is an array, but
      // will only ever contain one message, so we get index 0
      const webhookEvent = entry.messaging[0];
      console.log(webhookEvent);

      User.findOne({ facebookId: webhookEvent.sender.id }, (err, user) => {
        if (err) console.error(err);
        if (user) {
          if (webhookEvent.postback) {
            if (webhookEvent.postback.title === 'CRN ekle') {
              user.state = User.STATES.CRN_ADD;
              user.save();
              FacebookHelper.sendButton(user, "CRN'yi yazin!");
            } else if (webhookEvent.postback.title === 'Takip ettiklerim') {
              user.state = User.STATES.Default;
              user.save();
              FacebookHelper.showCrns(user).then(FacebookHelper.sendMenu(user, 'Ana menü'));
            } else if (webhookEvent.postback.title === 'CRN çıkar') {
              user.state = User.STATES.CRN_DELETE;
              user.save();
              FacebookHelper.sendTextMessage(user.facebookId, 'Tıkla!')
                .then(FacebookHelper.showCrns(user))
                .then(FacebookHelper.sendButton(user, 'Vazgeç'));
            } else if (webhookEvent.postback.title === 'Takibi bırak') {
              user.state = User.STATES.CRN_UNFOLLOW;
              user.save();
              FacebookHelper.sendTextMessage(user.facebookId, 'Yine bekleriz :)');
            } else if (webhookEvent.postback.payload === 'Cancel') {
              user.state = User.STATES.Default;
              user.save();
              FacebookHelper.sendMenu(user);
            } else if (webhookEvent.postback.title === 'Balkan Müziği al $$$') {
              FacebookHelper.sendTextMessage(user.facebookId, 'xD');
            } else if (user.state === User.STATES.CRN_DELETE) {
              const index = user.crns.findIndex(item => item.code === webhookEvent.postback.title);
              FacebookHelper.sendMenu(
                user,
                `Tesekkurler ${webhookEvent.postback.title} dersini artık takip etmiyorsun!`,
              );
              user.crns.splice(index, 1);
              user.state = User.STATES.Default;
              user.save();
            }
          } else if (webhookEvent.message) {
            if (user.state === User.STATES.Default) {
              FacebookHelper.sendMenu(user, `Selam ${user.name}`);
              user.inputs.push(webhookEvent.message.text);
              user.save();
            } else if (user.state === User.STATES.CRN_ADD) {
              // Return back to menu TODO
              if (user.crns.length >= 9) {
                FacebookHelper.sendTextMessage(
                  user.facebookId,
                  "Yalnizca 9 CRN'yi takip edebilirsin",
                );
              } else {
                user.crns.push({ code: webhookEvent.message.text });
                FacebookHelper.sendMenu(
                  user,
                  `Tesekkurler, ${
                    webhookEvent.message.text
                  } dersinde yer açılınca sana haber verecegiz!`,
                );
              }
              user.state = User.STATES.Default;
              user.save();
            } else if (user.state === User.STATES.CRN_DELETE) {
              // bu lojiği sil
              const index = user.crns.findIndex((item, i) => item.code === webhookEvent.message.text);
              if (index === -1) {
                FacebookHelper.sendTextMessage(
                  user.facebookId,
                  'Girdiğin CRN kodunu takip etmiyorsun!',
                );
                user.state = User.STATES.Default;
                user.save();
              } else {
                FacebookHelper.sendTextMessage(
                  user.facebookId,
                  `Tesekkurler ${webhookEvent.message.text} dersini artık takip etmiyorsun!`,
                ).then(FacebookHelper.sendMenu(user));
                user.crns.splice(index, 1);
                user.state = User.STATES.Default;
                user.save();
              }
            } else if (webhookEvent.message.text != Number(webhookEvent.message.text)) {
              FacebookHelper.sendTextMessage(
                user.facebookId,
                'Ne dediğini anlamıyorum ama not aldım. Yanlış CRN girmiş olabilirsin :/',
              );
              user.inputs.push(webhookEvent.message.text);
              user.state = User.STATES.Default;
              user.save();
            }
          }
        } else {
          FacebookHelper.getSenderInfo(webhookEvent.sender.id)
            .then((data) => {
              const newUser = new User({
                facebookId: webhookEvent.sender.id,
                name: data.first_name,
              });
              newUser.save();
              FacebookHelper.sendMenu(newUser, `Selam ${newUser.name}`);
            })
            .catch(error => console.error(error));
        }
      });
    });
    res
      .status(200)
      .send('EVENT_RECEIVED')
      .end();
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

router.get('/', (req, res) => {
  // Your verify token. Should be a random string.
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  // Parse the query params
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res
        .status(200)
        .send(challenge)
        .end();
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

module.exports = router;
