const User = require('../models/User');
const FacebookHelper = require('./facebook');
// import {} from './facebook';

function notificationToAll() {
  // At least one crn added users return.

  User.find({ 'crns.0': { $exists: true } })
    .populate('populatedCrns', 'crn capacity enrolled')
    .exec((err, users) => {
      if (err) console.log(err);
      users.forEach((user) => {
        const toSend = [];
        user.crns.forEach((crnObject) => {
          const index = user.populatedCrns.findIndex(item => item.crn === crnObject.code);

          if (index === -1) return;
          const isAvailable =
            user.populatedCrns[index].capacity > user.populatedCrns[index].enrolled;

          if (isAvailable) {
            toSend.push(crnObject.code);
          }
        });
        if (toSend.length > 0) {
          FacebookHelper.sendTextMessage(
            user.facebookId,
            `Bu CRNlerin boş oldugunu fark ettik: ${toSend.join(', ')}`,
          );
          toSend.map((x) => {
            const index = user.crns.findIndex(item => item.code === x);
            user.crns.splice(index, 1);
            return x;
          });
        }
        user.save();
      });
    });
}

function Notification() {}

Notification.prototype.notificationToAll = notificationToAll;

module.exports = Notification;
