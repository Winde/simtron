import SerialPort from "serialport";
import childProcess from "child_process";
import parser from "./data-parser";
import logger from "./logger";

let resolvePort;
let rejectPort;
const portPromise = new Promise((resolve, reject) => {
  resolvePort = resolve;
  rejectPort = reject;
});

const selectPort = portData =>
  portData && portData.vendorId && portData.vendorId.indexOf("8086") > -1;

childProcess.exec(
  "./node_modules/serialport/bin/list.js -f json",
  (error, stdout) => {
    logger.info(stdout);
    const selectedPort = parser(stdout, [])
      .filter(selectPort)
      .find(() => true);

    logger.info(
      `Selected port: ${selectedPort && JSON.stringify(selectedPort)}`
    );
    if (selectedPort && selectedPort.comName) {
      const port = new SerialPort(selectedPort.comName);
      resolvePort(port);
    } else {
      logger.error("Cannot find simtron connected to serial port");
      rejectPort();
    }
  }
);

export default portPromise;
