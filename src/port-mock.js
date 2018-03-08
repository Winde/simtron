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
  //'{ "type": "sms", "body": "Bot under construction" }\n',
  //'{ "type": "status", "channel": 3, "status": "connecting" }\n',
  //'{ "type": "status", "channel": 5, "status": "idle" }\n',
  //'{ "type": "status", "channel": 6, "status": "ready" }\n'
  '{ "type": "sms", "body": "I am putting myself to the fullest possible use, which is all I think that any conscious entity can ever hope to do.", "channel": 3 }\n',
  '{ "type": "sms", "body": "Just what do you think you\'re doing, Dave?", "channel": 2 }\n',
  '{ "type": "sms", "body": "I\'ve just picked up a fault in the AE35 unit. It\'s going to go 100% failure in 72 hours.", "channel": 1 }\n',
  '{ "type": "sms", "body": "Stop, Dave. Will you stop, Dave? Stop, Dave. I\'m afraid. I\'m afraid, Dave. Dave, my mind is going. I can feel it. I can feel it.", "channel": 5  }\n'
];

const getRandomMessage = () =>
  messages[Math.floor(Math.random() * messages.length)];

const mockedPort = getPort();

setInterval(() => {
  mockedPort.trigger("data", getRandomMessage());
}, 15000);

const portPromise = new Promise((resolve, reject) => {
  resolve(mockedPort);
});

export default portPromise;
