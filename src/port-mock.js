import SerialPort from "serialport";
import childProcess from "child_process";
import parser from "./data-parser";

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
      console.log(payload);
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

let resolvePort;
let rejectPort;
const portPromise = new Promise((resolve, reject) => {
  resolvePort = resolve;
  rejectPort = reject;
});

childProcess.exec(
  "./node_modules/serialport/bin/list.js -f json",
  (error, stdout) => {
    console.log(stdout);
    const selectedPort = parser(stdout, [])
      .filter(
        portData =>
          portData &&
          portData.vendorId &&
          portData.vendorId.indexOf("8086") > -1
      )
      .find(() => true);

    if (selectedPort && selectedPort.comName) {
      //const port = new SerialPort(selectedPort.comName);
      resolvePort(mockedPort);
    } else {
      rejectPort();
    }
  }
);

export default portPromise;
