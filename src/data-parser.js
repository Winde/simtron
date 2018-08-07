import logger from './logger';
import getDictionary, {storeIccChannel, findIccChannel} from './dictionary';

export const MESSAGE_TYPE_PLAIN = 'plain';
export const MESSAGE_TYPE_RICH = 'rich';
export const MESSAGE_TYPE_UNKNOWN = 'unknown';

const NOT_REGISTERED = 0;
const REGISTERED_HOME = 1;
const SEARCHING = 2;
const REGISTRATION_DENIED = 3;
const UNKNOWN = 4;
const REGISTERED_ROAMING = 5;
const REGISTERED_HOME_SMS_ONLY = 6;
const REGISTERED_ROAMING_SMS_ONLY = 7;
const REGISTERED_FOR_EMERGENCY_ONLY = 8;
const REGISTERED_HOME_FOR_CSFB = 9;
const REGISTERED_ROAMING_FOR_CSFB = 10;

const parse = payload => {
    let result = payload;
    try {
        result = JSON.parse(payload);
    } catch (e) {
        logger.error(e);
    }
    return result;
};

let serialLineBuffer = '';
export const readLine = (dataChunk, onLineReceived) => {
    const dataChunkLength = dataChunk.length;

    for (let i = 0; i < dataChunkLength; i++) {
        const charCode = dataChunk.charCodeAt(i);
        if (charCode != 10 && charCode != 13) {
            serialLineBuffer += dataChunk.charAt(i);
        } else {
            if (serialLineBuffer !== '') {
                onLineReceived(serialLineBuffer);
            }
            serialLineBuffer = '';
        }
    }
    return serialLineBuffer;
};

const getSimDataFromMessage = message => {
    const dictionary = getDictionary();
    return (
        dictionary.findSim({
            msisdn: message.msisdn && message.msisdn !== '?' ? message.msisdn : undefined,
            icc: message.icc,
        }) || {}
    );
};

const serializeSimData = ({simData, hlChar}) =>
    simData.msisdn
        ? ':' +
          (simData.flag || 'flag-aq') +
          ': ' +
          hlChar +
          simData.msisdn +
          ' ' +
          simData.provider +
          ' ' +
          simData.paymentModel +
          hlChar
        : '';

const serializeMessageId = message =>
    (message.msisdn && message.msisdn != '?') ||
    (message.channel != undefined && 'Channel ' + message.channel) ||
    '';

const identifySim = ({message, simData, hlChar}) =>
    serializeSimData({simData, hlChar}) ? serializeSimData({simData, hlChar}) : serializeMessageId(message);

const isStatusOk = statusCode => {
    switch (statusCode) {
        case REGISTERED_HOME:
        case REGISTERED_ROAMING:
        case REGISTERED_HOME_SMS_ONLY:
        case REGISTERED_ROAMING_SMS_ONLY:
        case REGISTERED_FOR_EMERGENCY_ONLY:
        case REGISTERED_HOME_FOR_CSFB:
        case REGISTERED_ROAMING_FOR_CSFB:
            return true;
        case SEARCHING:
        case NOT_REGISTERED:
        case REGISTRATION_DENIED:
        case UNKNOWN:
        default:
            return false;
    }
};

const getMessage = inputMessage => {
    if (inputMessage) {
        let simInfo = undefined;
        switch (inputMessage.type) {
            case 'sms':
                const simData = getSimDataFromMessage(inputMessage);
                simInfo = identifySim({
                    message: inputMessage,
                    simData: simData,
                    hlChar: '*',
                });
                return {
                    container: MESSAGE_TYPE_RICH,
                    text: simInfo,
                    attachments: [{text: inputMessage.body, color: '#3682ff'}]
                };
            case 'status':
                simInfo = identifySim({
                    message: inputMessage,
                    simData: getSimDataFromMessage(inputMessage),
                    hlChar: isStatusOk() ? '*' : '~',
                });
                const message = simInfo + '. ' + inputMessage.status + '.'
                return {
                    container: MESSAGE_TYPE_PLAIN,
                    text: message,
                };
            case 'booting':
                return {
                    container: MESSAGE_TYPE_PLAIN,
                    text: `:rocket: ${inputMessage.body}`,
                };
            case 'error':
                return {
                    container: MESSAGE_TYPE_PLAIN,
                    text: `:shit: ${inputMessage.body}`,
                };
            case 'info':
                return {
                    container: MESSAGE_TYPE_PLAIN,
                    text: `:sparkles: ${inputMessage.body}`,
                };
            case 'support':
                return {
                    container: MESSAGE_TYPE_PLAIN,
                    text: `:bulb: ${inputMessage.body}`,
                };
        }
    }
    return {
        container: MESSAGE_TYPE_UNKNOWN,
    };
};

export const parseMessage = rawPayload => {
    const data = parse(rawPayload);
    if (data.icc && data.icc !== '' && data.channel) {
        logger.info(`Storing ${data.icc} located in ${data.channel}`);
        storeIccChannel(data);
    }
    return getMessage(data);
};

export default parse;
