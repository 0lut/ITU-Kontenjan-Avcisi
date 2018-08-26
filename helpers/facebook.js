const axios = require('axios');

const url = 'https://graph.facebook.com/v2.6/me/messages';
//const env = process.env;
// TODO add .env

function getSenderInfo(id) {
  return axios
    .get(`https://graph.facebook.com/v2.6/${id}?fields=first_name,last_name,profile_pic&access_token=${
     process.env.PAGE_TOKEN
    }`)
    .then(res => res.data)
    .catch(err => console.error(err));
}

function callSendAPI(messageData) {
  return axios
    .post(`${url}?access_token=${process.env.MESSENGER_ACCESS_TOKEN}`, messageData)
    .then(res => res.data)
    .catch(err => console.error(err));
}

function sendTextMessage(recipientId, messageText) {
  const messageData = {
    recipient: {
      id: recipientId,
    },
    message: {
      text: messageText,
      metadata: 'DEVELOPER_DEFINED_METADATA',
    },
  };

  return callSendAPI(messageData);
}

function sendMenu(user, message) {
  return sendTextMessage(user.facebookId, message).then(callSendAPI({
    recipient: {
      id: user.facebookId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
              title: 'Daha fazla seçenek için kaydır',
              buttons: [{
                  type: 'postback',
                  title: 'CRN ekle',
                  payload: 'ADD_CRN',
                },
                {
                  type: 'postback',
                  title: 'CRN çıkar',
                  payload: 'REMOVE_CRN',
                },
                {
                  type: 'postback',
                  title: 'Takip ettiklerim',
                  payload: 'LIST_CRN',
                },
              ],
            },
            {
              title: 'Daha fazla seçenek için kaydır',
              buttons: [{
                  type: 'postback',
                  title: 'Takibi bırak',
                  payload: 'UNFOLLOW',
                },
                {
                  type: 'web_url',
                  title: 'Balkan Müziği al $$$',
                  url: 'https://norveclibalikci.github.io/itu-kontenjan-takipcisi/balkan.html',
                },
              ],
            },
          ],
        },
      },
    },
  }));
}

function showCrns(user) {
  const buttonDiv = {
    title: 'Daha fazla seçenek için kaydır',
    buttons: []
  };
  const elements = [];
  for (let i = 0; i < user.crns.length; i++) {
    buttonDiv.buttons.push({
      type: 'postback',
      title: user.crns[i].code,
      payload: user.crns[i].code,
    });
    if (i % 3 === 2 && i !== user.crns.length - 1) {
      const toPush = { ...buttonDiv
      };
      elements.push(toPush);
      buttonDiv.buttons = [];
    }
  }
  elements.push(buttonDiv);
  const payload = {
    recipient: {
      id: user.facebookId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements,
        },
      },
    },
  };
  return callSendAPI(payload);
}

function sendButton(user, title) {
  return callSendAPI({
    recipient: {
      id: user.facebookId,
    },
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{
            title,
            buttons: [{
              type: 'postback',
              title: 'Vazgeç',
              payload: 'Cancel',
            }, ],
          }, ],
        },
      },
    },
  });
}

module.exports = {
  getSenderInfo,
  sendTextMessage,
  callSendAPI,
  sendMenu,
  showCrns,
  sendButton,
};
// showCrns({ crns: [1, 2, 3, 4], facebookId: '1557502067700531' });
// sendMenu({ facebookId: '1557502067700531', name: 'Nafiz' });
// send({ facebookId: '1557502067700531', name: 'Nafiz' });
// sendTextMessage(
//   '1557502067700531',
//   '32454 kodlu AKM dersi son aldığımız bilgilere göre boş görünüyor! Şuan senin için rezerve ettik, sadece 150 liraya bu derse sahip olabilirsin!',
// );
// Example usage
// getSenderInfo('1557502067700531').then(x => console.log(x));