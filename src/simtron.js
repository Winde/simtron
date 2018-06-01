import {RtmClient, WebClient, RTM_EVENTS, CLIENT_EVENTS} from '@slack/client';
import {
    isMessage,
    isMessageToChannel,
    isFromUser,
    isFromAnyUser,
    messageContainsText,
    messageContainsAnyText,
    messageContainsAllTexts,
    getValueFromMessage,
} from './utils';
import parse, {parseMessage, readLine, MESSAGE_TYPE_PLAIN, MESSAGE_TYPE_RICH} from './data-parser';
import getDictionary, {findIccChannel} from './dictionary';
import {enableSim, disableSim, statusSim, catalogSims} from './actions';

const defaultOptions = {
    messageColor: '#590088',
    usePictures: false,
    logger: console,
    rtmOptions: {},
};

const askForSims = ['sims', 'numbers', 'telephones', 'telefonos', 'numeros', 'sim', 'telefono'];

const simtron = (botToken, options = {}, port) => {
    let botId;

    const opt = Object.assign({}, defaultOptions, options);
    const rtm = new RtmClient(botToken, opt.rtmOptions);
    const web = new WebClient(botToken);

    const getChannelFromEvent = event => {
        const dictionary = getDictionary();
        const msisdn = getValueFromMessage(event, dictionary.getMsisdns());
        const icc = dictionary.findSim({msisdn}).icc;
        return findIccChannel(icc);
    };

    const sendEnableSim = ({event}) => {
        const channel = getChannelFromEvent(event);
        opt.logger.info(`Enabling sim channel: ${channel}`);
        enableSim({port, channel});
    };

    const sendDisableSim = ({event}) => {
        const channel = getChannelFromEvent(event);
        opt.logger.info(`Disabling sim channel: ${channel}`);
        disableSim({port, channel});
    };

    const sendCatalog = ({event}) => {
        opt.logger.info(`Sending catalog request`);
        catalogSims({port});
    };

    const sendStatusSim = ({event}) => {
        const channel = getChannelFromEvent(event);
        opt.logger.info(`Getting status for channel: ${channel}`);
        statusSim({port, channel});
    };

    const sendReset = () => {
        opt.logger.info('Resetting hardware');
        reset({port});
    };

    const postMessageToChannels = message => channels => {
        channels.map(channel => {
            opt.logger.info(`Posting message to ${channel.name}`, message);
            message.container === MESSAGE_TYPE_PLAIN &&
                web.chat.postMessage(channel.id, message.text, {as_user: true});
            message.container === MESSAGE_TYPE_RICH &&
                web.chat.postMessage(channel.id, '', {...message, as_user: true});
        });
    };

    const getGroups = () => web.groups.list().then(res => res.groups);
    const getChannels = () =>
        web.channels.list().then(res => res.channels.filter(channel => channel.is_member));

    const writeMessage = line => {
        opt.logger.info(line);
        const message = parseMessage(line);
        getGroups().then(postMessageToChannels(message));
        getChannels().then(postMessageToChannels(message));
    };

    const answerChannel = ({opt, event, message}) => {
        const msgOptions = {
            as_user: true,
            attachments: [
                {
                    color: opt.messageColor,
                    title: message,
                },
            ],
        };

        web.chat.postMessage(event.channel, '', msgOptions);
        opt.logger.info(`Posting message to ${event.channel}`, msgOptions);
    };

    const messageUserName = (username, text) => (username ? `@${username} ` : ` `) + text;

    const speeches = [
        {
            condition: ({opt, event, dictionary}) =>
                messageContainsAnyText(event, dictionary.getMsisdns()) &&
                isFromAnyUser(event, opt.admins) &&
                messageContainsAnyText(event, 'enable'),

            action: ({event, username, dictionary}) => {
                sendEnableSim({event});
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, 'Enable sim acknowledged!'),
                });
            },
        },
        {
            condition: ({opt, event, dictionary}) =>
                messageContainsAnyText(event, dictionary.getMsisdns()) &&
                isFromAnyUser(event, opt.admins) &&
                messageContainsAnyText(event, 'disable'),
            action: ({event, username, dictionary}) => {
                sendDisableSim({event});
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, 'Disable sim acknowledged!'),
                });
            },
        },
        {
            condition: ({opt, event, dictionary}) =>
                messageContainsAnyText(event, dictionary.getMsisdns()) &&
                messageContainsAnyText(event, 'status'),
            action: ({event, username, dictionary}) => {
                sendStatusSim({event});
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, 'Getting status info...'),
                });
            },
        },
        {
            condition: ({opt, event, dictionary}) =>
                messageContainsAnyText(event, dictionary.getMsisdns()) &&
                isFromAnyUser(event, opt.admins) &&
                messageContainsAnyText(event, 'reset'),
            action: ({event, username, dictionary}) => {
                sendReset();
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, 'Reset hardware acknowledged!'),
                });
            },
        },
        {
            condition: ({opt, event, dictionary}) =>
                messageContainsAnyText(event, dictionary.getMsisdns()) && isFromAnyUser(event, opt.admins),
            action: ({event, username, dictionary}) => {
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, "Use 'enable PHONENUMBER' or 'disable PHONENUMBER' "),
                });
            },
        },
        {
            condition: ({opt, event, dictionary}) => messageContainsAnyText(event, dictionary.getMsisdns()),
            action: ({event, username, dictionary}) => {
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, 'Admin actions are restricted'),
                });
            },
        },
        {
            condition: ({opt, event, dictionary}) => true,
            action: ({event, username, dictionary}) => {
                sendCatalog({event});
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, 'Getting catalogue info...'),
                });
            },
        },
    ];

    port.on('data', payload => {
        try {
            opt.logger.info(payload);
            const decodedInput = payload.toString('utf8');
            readLine(decodedInput, writeMessage);
        } catch (e) {
            opt.logger.error(e);
        }
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

                const speech = speeches.find(item => item.condition({opt, event, dictionary}));
                if (speech && speech.action) {
                    speech.action({event, username, dictionary});
                } else {
                    answerChannel({
                        opt,
                        event,
                        message: 'Oops, there was an error!',
                    });
                }
            });
        }
    });

    rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData => {
        botId = rtmStartData.self.id;
        opt.logger.info(
            `Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`
        );
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
