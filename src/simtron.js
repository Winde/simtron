import { RtmClient, WebClient, RTM_EVENTS, CLIENT_EVENTS } from "@slack/client";
import {
  isMessage,
  isMessageToChannel,
  isFromUser,
  messageContainsText,
  messageContainsAnyText,
  messageContainsAllTexts,
  getValueFromMessage
} from "./utils";
//import port from "./port-mock";
import parse, { parseMessage } from "./data-parser";
import dictionary from "./dictionary";
import { enableSim, statusSim } from "./actions";

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
    const msisdn = getValueFromMessage(event, Object.keys(dictionary));
    const channel = dictionary[msisdn];

    opt.logger.info(`Enabling sim channel: ${channel} for number: ${msisdn}`);
    enableSim({ port, channel });
    return "";
  };

  const getGroups = () => web.groups.list().then(res => res.groups);

  port.on("data", payload => {
    const text = parseMessage(payload);
    if (text) {
      const msgOptions = { as_user: true };
      const message = { ...msgOptions, attachments: [{ title: text }] };
      getGroups().then(groups =>
        groups.map(group => {
          opt.logger.info(`Posting message to ${group.name}`, message);
          web.chat.postMessage(group.id, "", message);
        })
      );
    }
  });

  rtm.on(RTM_EVENTS.MESSAGE, event => {
    if (
      isMessage(event) &&
      isMessageToChannel(event) &&
      !isFromUser(event, botId) &&
      messageContainsAllTexts(event, ["simtron"])
    ) {
      web.users.info(event.user).then(response => {
        const username = response && response.user && response.user.name;
        let ack = username ? `@${username}: Acknowledged!` : "Acknowledged!";
        if (messageContainsAnyText(event, Object.keys(dictionary))) {
          sendEnableSim({ event });
        } else if (messageContainsAnyText(event, askForSims)) {
          ack = `${ack} We have the following numbers: ${Object.keys(
            dictionary
          ).join("\r\n")}`;
        } else {
          ack = username ? `@${username}: Whaaaaaa?` : "Whaaaaaa?";
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
