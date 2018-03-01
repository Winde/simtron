const getStatus = ({ channel }) => `status ${channel}`;

const enableMessage = ({ channel }) => `enable ${channel}`;

export const enableSim = ({ port, channel }) =>
  port && port.write && port.write(enableMessage({ channel }));

export const statusSim = ({ port, channel }) =>
  port && port.write && port.write(getStatus({ channel }));
