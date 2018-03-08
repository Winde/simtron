import storage from "node-persist";
import logger from "./logger";

const dictionary = {
  5511942501644: {
    channel: 0,
    provider: "VIVO_LEGACY",
    paymentModel: "control"
  },
  5511956102979: {
    channel: 1,
    provider: "VIVO_LEGACY",
    paymentModel: "prepay"
  },
  5521995382603: {
    channel: 2,
    provider: "VIVO_LEGACY",
    paymentModel: "postpay"
  },
  5511974468124: {
    channel: 4,
    provider: "VIVO_BEATRIX",
    paymentModel: "control"
  },
  5521995148544: {
    channel: 5,
    provider: "VIVO_LEGACY",
    paymentModel: "prepay"
  },
  447519194626: {
    channel: 6,
    provider: "O2",
    paymentModel: "postpay"
  }
};

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

const getDictionary = () => {
  return storage.getItemSync("dictionary");
};

export default getDictionary;
