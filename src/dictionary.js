import storage from "node-persist";
import logger from "./logger";

const dictionary = [
  {
    channel: 0,
    icc: "89551025139002042458",
    provider: "Vivo Legacy",
    paymentModel: "Control",
    msisdn: "5511942501087"
  },
  {
    channel: 1,
    icc: "89551093144180753691",
    provider: "Vivo Legacy",
    paymentModel: "Postpay",
    msisdn: "5521995382603"
  },
  {
    channel: 2,
    icc: "89551093244094886072",
    provider: "Vivo Legacy",
    paymentModel: "Prepay",
    msisdn: "5511956102979"
  },
  {
    channel: 3,
    icc: "8954075144249486461",
    provider: "Movistar B2C",
    paymentModel: "Control",
    msisdn: "541122924345"
  },
  {
    channel: 4,
    icc: "89551093244021867187",
    provider: "Vivo Beatrix",
    paymentModel: "Control",
    msisdn: "5511974468124"
  },
  {
    channel: 5,
    icc: "89551093144180753659",
    provider: "Vivo Legacy",
    paymentModel: "Prepay",
    msisdn: "5521995148544"
  },
  {
    channel: 6,
    icc: "",
    provider: "O2",
    paymentModel: "postpay",
    msisdn: "447519194626"
  },
  {
    channel: 7,
    icc: "89551025139002042482",
    provider: "Vivo Legacy",
    paymentModel: "Control",
    msisdn: "5511942502249"
  }
];

storage.initSync({
  dir: "dictionary.storage",
  stringify: JSON.stringify,
  parse: JSON.parse,
  encoding: "utf8",
  logging: false,
  continuous: true,
  interval: false,
  ttl: false
});
storage.setItemSync("dictionary", dictionary);

const Dictionary = dictionary => ({
  findSim: ({ channel, icc, msisdn }) =>
    dictionary.find(
      item =>
        item.icc === icc || item.channel === channel || item.msisdn === msisdn
    ),
  getData: () => dictionary,
  getMsisdns: () => dictionary.map(item => item.msisdn)
});

const getDictionary = () => {
  return Dictionary(storage.getItemSync("dictionary"));
};

export default getDictionary;
