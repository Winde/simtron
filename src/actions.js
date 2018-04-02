const getStatus = ({ channel }) => `status ${channel}\n`;
const enableMessage = ({ channel }) => `enable ${channel}\n`;
const disableMessage = ({ channel }) => `disable ${channel}\n`;
const catalog = () => `catalog\n`;

export const enableSim = ({ port, channel }) =>
  port && port.write && port.write(enableMessage({ channel }));

export const disableSim = ({ port, channel }) =>
  port && port.write && port.write(disableMessage({ channel }));

export const statusSim = ({ port, channel }) =>
  port && port.write && port.write(getStatus({ channel }));

export const catalogSims = ({ port }) =>
  port && port.write && port.write(catalog());
