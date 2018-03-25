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

const getMsisdnFromMessage = message => {
  const dictionary = getDictionary();  
  const { msisdn } =
    dictionary.findSim({
      channel: message.channel,
      icc: message.icc
    }) || {};
  return msisdn;
}

const getStatusMessage = message => {
  const msisdn = getMsisdnFromMessage(message);  
  const text = `Channel ${message.channel} status is: ${message.status}`;
  return msisdn ? msisdn + ": " + text : text
}
  
const getBodyMessage = message => {
  const msisdn = getMsisdnFromMessage(message);
  return msisdn ? msisdn + ": " + message.body : message.body
};

export const parseMessage = payload => {
  const data = parse(payload);
  return data.body ? getBodyMessage(data) : getStatusMessage(data)  
};

export default parse;
