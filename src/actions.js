const getStatus = ({ channel }) => `{ type: "status", channel: ${channel} }`;

const enableMessage = ({ channel }) =>
  `{ type: "enable", channel: ${channel} }`;

export const enableSim = ({ port, channel }) =>
  port && port.write && port.write(enableMessage({ channel }));

export const statusSim = ({ port, channel }) =>
  port && port.write && port.write(getStatus({ channel }));
