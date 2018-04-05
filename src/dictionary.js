import storage from 'node-persist';
import logger from './logger';

const dictionary = [
    {
        icc: '89551025139002042482',
        provider: 'Vivo Legacy',
        paymentModel: 'Control',
        msisdn: '5511942502249',
    },
    {
        icc: '89551093144180753659',
        provider: 'Vivo Legacy',
        paymentModel: 'Prepay',
        msisdn: '5521995148544',
    },
    {
        icc: '89551093244094886072',
        provider: 'Vivo Legacy',
        paymentModel: 'Prepay',
        msisdn: '5511956102979',
    },
    {
        icc: '89551093144180753691',
        provider: 'Vivo Legacy',
        paymentModel: 'Postpay',
        msisdn: '5521995382603',
    },

    {
        icc: '89551093244021869431',
        provider: 'Vivo Beatrix',
        paymentModel: 'Postpay',
        msisdn: '5511975807254',
    },
    {
        icc: '8954079144210016210',
        provider: 'Movistar B2C',
        paymentModel: 'Full',
        msisdn: '541144203936',
    },
    {
        icc: '8954079144256579014',
        provider: 'Movistar B2B',
        paymentModel: 'Control',
        msisdn: '541165271099',
    },
    {
        icc: '8944110066707387600',
        provider: 'O2',
        paymentModel: 'postpay',
        msisdn: '447519194626',
    },
];

storage.initSync({
    dir: 'dictionary.storage',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,
    continuous: true,
    interval: false,
    ttl: false,
});
storage.setItemSync('dictionary', dictionary);

const Dictionary = dictionary => ({
    findSim: ({channel, icc, msisdn}) =>
        dictionary.find(
            item => (icc && item.icc && icc.startsWith(item.icc)) || (msisdn && item.msisdn === msisdn)
        ),
    getData: () => dictionary,
    getMsisdns: () => dictionary.map(item => item.msisdn),
});

const getDictionary = () => {
    return Dictionary(storage.getItemSync('dictionary'));
};

export default getDictionary;
