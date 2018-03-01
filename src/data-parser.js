import logger from "./logger";

const parse = (payload, bydefault = {}) => {
  let result = bydefault;
  try {
    result = JSON.parse(payload);
  } catch (e) {
    logger.error(e);
  }
  return result;
};

let serialLineBuffer = "";
export const readLine = (dataChunk, onLineReceived) => {
  const dataChunkLength = dataChunk.length;

  for (let i = 0; i < dataChunkLength; i++) {
    const charCode = dataChunk.charCodeAt(i);
    if (charCode != 10 && charCode != 13) {
      serialLineBuffer += dataChunk.charAt(i);
    } else {
      if (serialLineBuffer !== "") {
        onLineReceived(serialLineBuffer);
      }
      serialLineBuffer = "";
    }
  }
  return serialLineBuffer;
};

const getStatusMessage = message =>
  `Channel ${message.channel} is ${message.status}`;
const getBodyMessage = message => message.body;

export const parseMessage = payload => {
  const data = parse(payload);
  let message = "";
  if (data.type === "status") {
    message = getStatusMessage(data);
  } else if (data.type === "sms" || data.type === "booting") {
    message = getBodyMessage(data);
  }
  return message;
};

export default parse;
