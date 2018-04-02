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
import { enableSim, disableSim, statusSim, catalogSims } from "./actions";

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
    const msisdn = getValueFromMessage(event, dictionary.getMsisdns());
    console.log(msisdn);
    const channel = dictionary.findSim({ msisdn }).channel;

    opt.logger.info(`Enabling sim channel: ${channel} for number: ${msisdn}`);
    enableSim({ port, channel });
    return "";
  };

  const sendDisableSim = ({ event }) => {
    const dictionary = getDictionary();
    const msisdn = getValueFromMessage(event, dictionary.getMsisdns());
    const channel = dictionary.findSim({ msisdn }).channel;

    opt.logger.info(`Disabling sim channel: ${channel} for number: ${msisdn}`);
    disableSim({ port, channel });
    return "";
  };

  const sendCatalog = ({ event }) => {
    opt.logger.info(`Sending catalog request`);
    catalogSims({ port });
    return "";
  };

  const sendStatusSim = ({ event }) => {
    const dictionary = getDictionary();
    const msisdn = getValueFromMessage(event, dictionary.getMsisdns());
    const channel = dictionary.findSim({ msisdn }).channel;

    opt.logger.info(
      `Getting status for channel: ${channel} and number: ${msisdn}`
    );
    statusSim({ port, channel });
    return "";
  };

  const postMessageToChannels = (message, text) => channels =>
    channels.map(channel => {
      opt.logger.info(`Posting message to ${channel.name}`, message);
      web.chat.postMessage(channel.id, text, message);
    });

  const getGroups = () => web.groups.list().then(res => res.groups);
  const getChannels = () =>
    web.channels
      .list()
      .then(res => res.channels.filter(channel => channel.is_member));

  const writeMessage = line => {
    opt.logger.info(line);
    const text = parseMessage(line);
    if (text) {
      const msgOptions = { as_user: true };
      const message = { ...msgOptions };
      getGroups().then(postMessageToChannels(message, text));
      getChannels().then(postMessageToChannels(message, text));
    }
  };

  const answerChannel = ({ opt, event, message }) => {
    const msgOptions = {
      as_user: true,
      attachments: [
        {
          color: opt.messageColor,
          title: message
        }
      ]
    };

    web.chat.postMessage(event.channel, "", msgOptions);
    opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
  };

  const messageUserName = (username, text) =>
    (username ? `@${username} ` : ` `) + text;

  const speeches = [
    {
      condition: ({ opt, event, dictionary }) =>
        messageContainsAnyText(event, dictionary.getMsisdns()) &&
        isFromAnyUser(event, opt.admins) &&
        messageContainsAnyText(event, "enable"),

      action: ({ event, username, dictionary }) => {
        sendEnableSim({ event });
        answerChannel({
          opt,
          event,
          message: messageUserName(username, "Enable sim acknowledged!")
        });
      }
    },
    {
      condition: ({ opt, event, dictionary }) =>
        messageContainsAnyText(event, dictionary.getMsisdns()) &&
        isFromAnyUser(event, opt.admins) &&
        messageContainsAnyText(event, "disable"),
      action: ({ event, username, dictionary }) => {
        sendDisableSim({ event });
        answerChannel({
          opt,
          event,
          message: messageUserName(username, "Disable sim acknowledged!")
        });
      }
    },
    {
      condition: ({ opt, event, dictionary }) =>
        messageContainsAnyText(event, dictionary.getMsisdns()) &&
        messageContainsAnyText(event, "status"),
      action: ({ event, username, dictionary }) => {
        sendStatusSim({ event });
        answerChannel({
          opt,
          event,
          message: messageUserName(username, "Getting status info ...")
        });
      }
    },
    {
      condition: ({ opt, event, dictionary }) =>
        messageContainsAnyText(event, dictionary.getMsisdns()) &&
        isFromAnyUser(event, opt.admins),
      action: ({ event, username, dictionary }) => {
        answerChannel({
          opt,
          event,
          message: messageUserName(
            username,
            "Use 'enable PHONENUMBER' or 'disable PHONENUMBER' "
          )
        });
      }
    },
    {
      condition: ({ opt, event, dictionary }) =>
        messageContainsAnyText(event, dictionary.getMsisdns()),
      action: ({ event, username, dictionary }) => {
        answerChannel({
          opt,
          event,
          message: messageUserName(username, "Admin actions are restricted")
        });
      }
    },
    {
      condition: ({ opt, event, dictionary }) => true,
      action: ({ event, username, dictionary }) => {
        sendCatalog({ event });
        answerChannel({
          opt,
          event,
          message: messageUserName(username, "Getting status info ...")
        });
      }
    }
  ];

  port.on("data", payload => {
    opt.logger.info(payload);
    const decodedInput = payload.toString("utf8");
    const line = readLine(decodedInput, writeMessage);
  });

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

        const speech = speeches.find(item =>
          item.condition({ opt, event, dictionary })
        );
        if (speech && speech.action) {
          speech.action({ event, username, dictionary });
        } else {
          answerChannel({
            opt,
            event,
            message: "Oops, there was an error!"
          });
        }
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
