/* eslint no-restricted-syntax: "off" */

export const isMessage = event =>
  Boolean(event.type === "message" && event.text);

export const isMessageToChannel = message =>
  typeof message.channel === "string";

export const isFromUser = (event, userId) => event.user === userId;

export const sanitize = text =>
  text
    .toLowerCase()
    .replace(",", "")
    .replace(".", "")
    .replace(";", "");
export const getValueFromMessage = (event, possibleTexts) => {
  const messageText = sanitize(event.text);
  const texts = Array.isArray(possibleTexts) ? possibleTexts : [possibleTexts];
  const tokens = messageText.split(" ");
  for (const text of texts) {
    if (tokens.includes(text.toLowerCase())) {
      return text.toLowerCase();
    }
  }

  return false;
};

export const messageContainsAnyText = (event, possibleTexts) =>
  !!getValueFromMessage(event, possibleTexts);

export const messageContainsAllTexts = (event, allTexts) => {
  const messageText = sanitize(event.text);
  const texts = Array.isArray(allTexts) ? allTexts : [allTexts];
  const tokens = messageText.split(" ");
  for (const text of texts) {
    if (!tokens.includes(text)) {
      return false;
    }
  }

  return true;
};
