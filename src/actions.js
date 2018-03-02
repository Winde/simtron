const getStatus = ({ channel }) => `status ${channel}`;

const enableMessage = ({ channel }) => `enable ${channel}`;
const disableMessage = ({ channel }) => `disable ${channel}`;

export const enableSim = ({ port, channel }) =>
  port && port.write && port.write(enableMessage({ channel }));

export const disableSim = ({ port, channel }) =>
  port && port.write && port.write(disableMessage({ channel }));

export const statusSim = ({ port, channel }) =>
  port && port.write && port.write(getStatus({ channel }));
