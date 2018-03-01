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
  '{ "type": "sms", "body": "Bot under construction" }',
  '{ "type": "status", "channel": 3, "status": "connecting" }',
  '{ "type": "status", "channel": 5, "status": "idle" }',
  '{ "type": "status", "channel": 6, "status": "ready" }',
  '{ "type": "sms", "body": "I am putting myself to the fullest possible use, which is all I think that any conscious entity can ever hope to do." }',
  '{ "type": "sms", "body": "Just what do you think you\'re doing, Dave?" }',
  '{ "type": "sms", "body": "I\'ve just picked up a fault in the AE35 unit. It\'s going to go 100% failure in 72 hours." }'
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
