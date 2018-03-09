import logger from "./logger";
import getDictionary from "./dictionary";

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
  `Channel ${message.channel} status is: ${message.status}`;

const getBodyMessage = message => {
  let text = "";
  const dictionary = getDictionary();
  if (message.channel) {
    const { msisdn } =
      dictionary.findSim({
        channel: message.channel,
        icc: message.icc
      }) || {};
    if (msisdn) {
      text = msisdn + ": ";
    }
  }
  return text + " " + message.body;
};

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
