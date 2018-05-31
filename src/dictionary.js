import storage from 'node-persist';
import logger from './logger';

const dictionary = [
    // VIVO BR
    {
        icc: '89551025139002042482',
        provider: 'Vivo Legacy',
        paymentModel: 'Control',
        msisdn: '5511942502249',
        flag: 'flag-br',
    },
    {
        icc: '89551093144180753659',
        provider: 'Vivo Legacy',
        paymentModel: 'Prepay',
        msisdn: '5521995148544',
        flag: 'flag-br',
    },
    {
        icc: '89551093244094886072',
        provider: 'Vivo Legacy',
        paymentModel: 'Prepay',
        msisdn: '5511956102979',
        flag: 'flag-br',
    },
    {
        icc: '89551093144180753691',
        provider: 'Vivo Legacy',
        paymentModel: 'Postpay',
        msisdn: '5521995382603',
        flag: 'flag-br',
    },
    {
        icc: '89551093244021869431',
        provider: 'Vivo Beatrix',
        paymentModel: 'Postpay',
        msisdn: '5511975807254',
        flag: 'flag-br',
    },
    {
        icc: '89551025139002042458',
        provider: 'Vivo Legacy',
        paymentModel: 'Postpay',
        msisdn: '5511942501087',
        flag: 'flag-br',
    },
    // MOVISTAR AR
    {
        icc: '8954079144210016210',
        provider: 'Movistar Ar B2C',
        paymentModel: 'Full',
        msisdn: '541144203936',
        flag: 'flag-ar',
    },
    {
        icc: '8954073144104702194',
        provider: 'Movistar Ar B2C',
        paymentModel: 'Prepay',
        msisdn: '541165099125',
        flag: 'flag-ar',
    },
    {
        icc: '8954075144249486446',
        provider: 'Movistar Ar B2C',
        paymentModel: 'Control',
        msisdn: '541151339576',
        flag: 'flag-ar',
    },
        {
        icc: '8954079144256579014',
        provider: 'Movistar Ar B2B',
        paymentModel: 'Control',
        msisdn: '541165271099',
        flag: 'flag-ar',
    },
    // O2 UK
    {
        icc: '8944110066707387600',
        provider: 'O2 UK',
        paymentModel: 'postpay',
        msisdn: '447519194626',
        flag: 'flag-gb',
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
