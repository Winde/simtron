import logger from "./logger";

const getPort = () => {
  const eventMap = {};
  return {
    on: (event, callback) => {
      eventMap[event] = callback;
    },
    trigger: (event, payload) => {
      const callback = eventMap[event] || (() => {});
      callback(payload);
    },
    write: (payload, callbackErr) => {
      logger.info(payload);
    }
  };
};

const messages = [
  '{ "type": "sms", "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." }\n',
  '{"type": "status", "channel": 7, "isEnabled": 1, "msisdn": "?", "icc": "89551093144180753659f", "status": "Channel enabled, SIM present, Registered in roaming"}\n',
  '[{"type": "status", "channel": 7, "isEnabled": 1, "icc": "89551025139002042482f", "status": "Channel enabled, SIM present, Registered in roaming"},{"type": "status", "channel": 7, "isEnabled": 1, "icc": "89551025139002042482f", "status": "Channel enabled, SIM present, Registered in roaming"},{"type": "status", "channel": 7, "isEnabled": 1, "icc": "89551025139002042482f", "status": "Channel enabled, SIM present, Registered in roaming"}]\n',
  '{"type": "sms", "channel": 7, "icc": "89551093144180753659f", "sender": "+34684193653", "datetime": "18/03/20,00:54:51+04", "body": "Message 2"}\n',
  '{"type": "status", "channel": 7, "isEnabled": 1, "icc": "89551093244094886072f", "status": "Channel enabled, SIM present, Registered in roaming"}\n',
  '{ "type": "sms", "body": "I am putting myself to the fullest possible use, which is all I think that any conscious entity can ever hope to do.", "channel": 3 }\n'
  //'{ "type": "sms", "body": "Just what do you think you\'re doing, Dave?", "channel": 2 }\n',
  //'{ "type": "sms", "body": "I\'ve just picked up a fault in the AE35 unit. It\'s going to go 100% failure in 72 hours.", "channel": 1 }\n',
  //'{ "type": "sms", "body": "Stop, Dave. Will you stop, Dave? Stop, Dave. I\'m afraid. I\'m afraid, Dave. Dave, my mind is going. I can feel it. I can feel it.", "channel": 5  }\n'
];

const getRandomMessage = () =>
  messages[Math.floor(Math.random() * messages.length)];

const mockedPort = getPort();

setInterval(() => {
  mockedPort.trigger("data", getRandomMessage());
}, 5000);

const portPromise = new Promise((resolve, reject) => {
  resolve(mockedPort);
});

export default portPromise;
