import storage from 'node-persist';

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
    {
        icc: '89551022439003321221',
        provider: 'Vivo Beatrix',
        paymentModel: 'Postpay',
        msisdn: '5512996216580',
        flag: 'flag-br',
    },
    {
        icc: '89551022439003321080',
        provider: 'Vivo Beatrix',
        paymentModel: 'Control',
        msisdn: '5512996519788',
        flag: 'flag-br',
    },
    {
        icc: '89551025339001566131',
        provider: 'Vivo Legacy',
        paymentModel: 'Prepay',
        msisdn: '5511995658894',
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

let simChannels = {};

export const storeIccChannel = ({icc, channel}) => {
    simChannels[icc] = channel;
};

export const findIccChannel = icc => {
    const iccKey = Object.keys(simChannels).find(storedIcc => storedIcc.startsWith(icc));
    return simChannels[iccKey];
};

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
    findSim: message =>
        dictionary.find(
            item =>
                (message.icc && item.icc && message.icc.startsWith(item.icc)) ||
                (message.msisdn && item.msisdn === message.msisdn)
        ),
    getData: () => dictionary,
    getMsisdns: () =>
        dictionary.map(item => {
            return item.msisdn;
        }),
});

const getDictionary = () => {
    return Dictionary(storage.getItemSync('dictionary'));
};

export default getDictionary;
