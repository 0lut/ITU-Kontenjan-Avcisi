const User = require('../models/User');

function userHandler(user, message) {
  if (message === 'CRN ekle') user.state = User.STATES.CRN_ADD;
  else if (message === 'Takip ettiklerim') user.state = User.STATES.LIST;
  else if (message === 'CRN çıkar') user.state = User.STATES.CRN_DELETE;
  else if (message === 'Takibi bırak') user.state = -1;
  else user.state = User.STATES.Default;
  user.save();
}
module.exports = { userHandler };
