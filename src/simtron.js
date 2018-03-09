import { RtmClient, WebClient, RTM_EVENTS, CLIENT_EVENTS } from "@slack/client";
import {
  isMessage,
  isMessageToChannel,
  isFromUser,
  isFromAnyUser,
  messageContainsText,
  messageContainsAnyText,
  messageContainsAllTexts,
  getValueFromMessage
} from "./utils";
import parse, { parseMessage, readLine } from "./data-parser";
import getDictionary from "./dictionary";
import { enableSim, disableSim, statusSim } from "./actions";

const defaultOptions = {
  messageColor: "#590088",
  usePictures: false,
  logger: console,
  rtmOptions: {}
};

const askForSims = [
  "sims",
  "numbers",
  "telephones",
  "telefonos",
  "numeros",
  "sim",
  "telefono"
];

const simtron = (botToken, options = {}, port) => {
  let botId;

  const opt = Object.assign({}, defaultOptions, options);
  const rtm = new RtmClient(botToken, opt.rtmOptions);
  const web = new WebClient(botToken);

  const sendEnableSim = ({ event }) => {
    const dictionary = getDictionary();
    const msisdn = getValueFromMessage(event, Object.keys(dictionary));
    const channel = dictionary[msisdn].channel;

    opt.logger.info(`Enabling sim channel: ${channel} for number: ${msisdn}`);
    enableSim({ port, channel });
    return "";
  };

  const sendDisableSim = ({ event }) => {
    const dictionary = getDictionary();
    const msisdn = getValueFromMessage(event, Object.keys(dictionary));
    const channel = dictionary[msisdn].channel;

    opt.logger.info(`Disabling sim channel: ${channel} for number: ${msisdn}`);
    disableSim({ port, channel });
    return "";
  };

  const postMessageToChannels = message => channels =>
    channels.map(channel => {
      opt.logger.info(`Posting message to ${channel.name}`, message);
      web.chat.postMessage(channel.id, "", message);
    });

  const getGroups = () => web.groups.list().then(res => res.groups);
  const getChannels = () =>
    web.channels
      .list()
      .then(res => res.channels.filter(channel => channel.is_member));

  port.on("data", payload => {
    opt.logger.info(payload);
    const decodedInput = payload.toString("utf8");
    const line = readLine(decodedInput, writeMessage);
  });

  const writeMessage = line => {
    opt.logger.info(line);
    const text = parseMessage(line);
    if (text) {
      const msgOptions = { as_user: true };
      const message = { ...msgOptions, attachments: [{ title: text }] };
      getGroups().then(postMessageToChannels(message));
      getChannels().then(postMessageToChannels(message));
    }
  };

  const getDictionaryMessage = ({ dictionary }) =>
    `We have the following numbers: \r\n${Object.keys(dictionary)
      .map(
        key =>
          key +
          " " +
          dictionary[key].provider +
          " " +
          dictionary[key].paymentModel
      )
      .join(
        "\r\n"
      )} \r\n You can use these phone numbers to login into NOVUM, if you see no OTP SMS is received for a specific number, contact admins (warias or carlosfernandez) for help.`;

  const getWhatCanIdoMessage = () =>
    `Ask me for the phone numbers I handle to get a list of the sims I manage`;

  rtm.on(RTM_EVENTS.MESSAGE, event => {
    if (
      isMessage(event) &&
      isMessageToChannel(event) &&
      !isFromUser(event, botId) &&
      messageContainsAnyText(event, opt.botIds)
    ) {
      web.users.info(event.user).then(response => {
        const username = response && response.user && response.user.name;
        const dictionary = getDictionary();
        let ack = username ? `@${username} ` : ` `;
        if (messageContainsAnyText(event, Object.keys(dictionary))) {
          if (
            messageContainsAnyText(event, "enable") &&
            isFromAnyUser(event, opt.admins)
          ) {
            sendEnableSim({ event });
            ack = ack + "Enable sim acknowledged!";
          } else if (
            messageContainsAnyText(event, "disable") &&
            isFromAnyUser(event, opt.admins)
          ) {
            sendDisableSim({ event });
            ack = ack + "Disable sim acknowledged!";
          } else {
            ack = ack + "Admin actions are restricted";
          }
        } else {
          ack = getDictionaryMessage({ dictionary });
        }

        const msgOptions = {
          as_user: true,
          attachments: [
            {
              color: opt.messageColor,
              title: ack
            }
          ]
        };

        web.chat.postMessage(event.channel, "", msgOptions);
        opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
      });
    }
  });

  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData => {
    botId = rtmStartData.self.id;
    opt.logger.info(
      `Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${
        rtmStartData.team.name
      }`
    );
  });

  return {
    rtm,
    web,
    start() {
      rtm.start();
    }
  };
};

export default simtron;
