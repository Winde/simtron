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

const getMsisdn = ({ message, simData }) =>
  message.msisdn || simData.msisdn || "";

const getSimDataFromMessage = message => {
  const dictionary = getDictionary();
  return (
    dictionary.findSim({
      msisdn: message.msisdn,
      channel: message.channel,
      icc: message.icc
    }) || {}
  );
};

const serializeSimData = simData => {
  simData.msisdn
    ? simData.msisdn + " " + simData.provider + " " + simData.paymentModel
    : "";
};

const serializeMessageId = message =>
  message.msisdn ||
  (message.channel != undefined && "Channel " + message.channel) ||
  "";

const identifySim = ({ message, simData }) =>
  serializeSimData(simData)
    ? serializeSimData(simData)
    : serializeMessageId(message);

const getStatusMessage = message => {
  const simInfo = identifySim({
    message,
    simData: getSimDataFromMessage(message)
  });
  return `${simInfo} Status is: ${message.status}`;
};

const getBodyMessage = message => {
  const simInfo = identifySim({
    message,
    simData: getSimDataFromMessage(message)
  });
  return `${simInfo} ${message.body}`;
};

const getSingleMessage = data => {
  if (data) {
    return data.body ? getBodyMessage(data) : getStatusMessage(data);
  } else {
    return "";
  }
};
const getMessage = parsedPayload =>
  Array.isArray(parsedPayload)
    ? parsedPayload.reduce(
        (total, currentValue) => total + "\n" + getSingleMessage(currentValue),
        ""
      )
    : getSingleMessage(parsedPayload);

export const parseMessage = rawPayload => {
  const data = parse(rawPayload);
  console.log(data);
  const message = getMessage(data);
  console.log("MESSAGE: " + message);
  return message;
};

export default parse;
