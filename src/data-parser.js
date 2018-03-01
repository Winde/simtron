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
