import { RtmClient, WebClient, RTM_EVENTS, CLIENT_EVENTS } from '@slack/client';
import { isMessage, isMessageToChannel, isFromUser, messageContainsText } from './utils';

const defaultOptions = {
  triggerOnWords: ['simtron'],
  messageColor: '#590088',
  usePictures: false,
  logger: console,
  rtmOptions: {},
};

const simtron = (botToken, options = {}) => {
  let botId;

  const opt = Object.assign({}, defaultOptions, options);
  const rtm = new RtmClient(botToken, opt.rtmOptions);
  const web = new WebClient(botToken);

  setInterval(() => {
    const msgOptions = { as_user: true };

    web.groups.list().then((res) => {
      res.groups.map((channel) => {
        const message = { ...msgOptions, attachments: [{ title: 'PING' }] };
        opt.logger.info(`Posting sim message to ${channel.name}`, message);
        return web.chat.postMessage(channel.id, '', message);
      });
    });
  }, 10000);

  rtm.on(RTM_EVENTS.MESSAGE, (event) => {
    if (
      isMessage(event) &&
      isMessageToChannel(event) &&
      !isFromUser(event, botId) &&
      messageContainsText(event, opt.triggerOnWords)
    ) {
      const response = { text: 'hi' };
      const msgOptions = {
        as_user: true,
        attachments: [
          {
            color: opt.messageColor,
            title: response.text,
          },
        ],
      };

      web.chat.postMessage(event.channel, '', msgOptions);
      opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
    }
  });

  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
    botId = rtmStartData.self.id;
    opt.logger.info(`Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`);
  });

  return {
    rtm,
    web,
    start() {
      rtm.start();
    },
  };
};

export default simtron;
