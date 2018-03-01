import winston from "winston";

const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      timestamp() {
        return new Date().toISOString();
      }
    })
  ]
});

logger.cli();

export default logger;
